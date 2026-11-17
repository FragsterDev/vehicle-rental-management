const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Helper function to automatically mark bookings as 'overdue' if returnDate has passed
// and calculate overdue charges if vehicle is not returned within 24 hours of returnDate
const updateOverdueBookings = async () => {
  const now = new Date();

  // 1. Mark active bookings where returnDate < now as 'overdue'
  await Booking.updateMany(
    {
      status: 'active',
      returnDate: { $lt: now },
    },
    {
      $set: { status: 'overdue' },
    }
  );

  // 2. Compute overdue charges for overdue bookings
  const overdueBookings = await Booking.find({ status: 'overdue' }).populate('vehicle');
  for (const b of overdueBookings) {
    const returnTime = new Date(b.returnDate).getTime();
    const gracePeriodMs = 24 * 60 * 60 * 1000; // 24-hour grace period
    const diffMs = now.getTime() - returnTime;

    // Apply overdue charges only if not returned within 24 hours of due date
    if (diffMs > gracePeriodMs) {
      const overdueDays = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
      const dailyRate = b.vehicle?.pricePerDay || (b.totalPrice && b.days ? Math.round(b.totalPrice / b.days) : 1000);
      const computedFee = overdueDays * dailyRate;
      if (b.overdueFee !== computedFee) {
        b.overdueFee = computedFee;
        await b.save();
      }
    } else {
      if (b.overdueFee !== 0) {
        b.overdueFee = 0;
        await b.save();
      }
    }
  }
};

// 1. RENT A VEHICLE (USER)
// Route: POST /api/bookings
router.post('/', verifyToken, async (req, res) => {
  try {
    const { vehicleId, bookingDate, returnDate, days, deliveryAddress, paymentMethod, paymentId, orderId } = req.body;

    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID is required.',
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    if (!vehicle.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This vehicle is currently unavailable or rented out.',
      });
    }

    // Determine startDate and returnDate
    const start = bookingDate ? new Date(bookingDate) : new Date();
    let end;
    let rentalDays = Number(days) || 1;

    if (returnDate) {
      end = new Date(returnDate);
      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'Return date must be after the booking start date.',
        });
      }
      // Calculate rental days based on date difference (minimum 1 day)
      const diffTime = Math.abs(end - start);
      rentalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } else {
      // Compute returnDate from rental days
      end = new Date(start.getTime() + rentalDays * 24 * 60 * 60 * 1000);
    }

    const totalPrice = vehicle.pricePerDay * rentalDays;

    // Check if the returnDate is already in the past (e.g. historical entry)
    const isPastDue = end < new Date();
    const initialStatus = isPastDue ? 'overdue' : 'active';

    // Resolve delivery address: from body or user profile
    let finalDeliveryAddress = (deliveryAddress || '').trim();
    if (!finalDeliveryAddress) {
      const userDoc = await User.findById(req.user.id);
      if (userDoc && userDoc.address) {
        finalDeliveryAddress = userDoc.address;
      }
    }

    // Generate simulated payment credentials if not provided
    const finalPaymentId = paymentId || `pay_sim_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const finalOrderId = orderId || `order_sim_${Date.now()}`;
    const finalPaymentMethod = paymentMethod || 'UPI';

    const booking = new Booking({
      user: req.user.id,
      vehicle: vehicle._id,
      bookingDate: start,
      returnDate: end,
      days: rentalDays,
      totalPrice,
      deliveryAddress: finalDeliveryAddress,
      overdueFee: 0,
      status: initialStatus,
      paymentStatus: 'paid',
      paymentMethod: finalPaymentMethod,
      paymentId: finalPaymentId,
      orderId: finalOrderId,
    });

    await booking.save();

    // Mark vehicle as rented out
    vehicle.isAvailable = false;
    await vehicle.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('vehicle')
      .populate('user', 'name email phone address');

    res.status(201).json({
      success: true,
      message: `Vehicle ${vehicle.make} ${vehicle.name} successfully booked from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}!`,
      data: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// 2. GET CURRENT USER'S RENTALS
// Route: GET /api/bookings/my-rentals
router.get('/my-rentals', verifyToken, async (req, res) => {
  try {
    // Automatically update overdue status before fetching
    await updateOverdueBookings();

    const bookings = await Booking.find({ user: req.user.id })
      .populate('vehicle')
      .populate('user', 'name email phone address')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// 3. GET ALL BOOKINGS (ADMIN ONLY)
// Route: GET /api/bookings
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Automatically update overdue status before fetching
    await updateOverdueBookings();

    const bookings = await Booking.find()
      .populate('vehicle')
      .populate('user', 'name email phone address')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// 4. RETURN A RENTED VEHICLE
// Route: PATCH /api/bookings/:id/return
router.patch('/:id/return', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Verify ownership or admin privileges
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to return this rental.',
      });
    }

    if (booking.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'This vehicle has already been marked as returned.',
      });
    }

    // Calculate final overdueFee if vehicle is returned late
    const now = new Date();
    const returnTime = new Date(booking.returnDate).getTime();
    const gracePeriodMs = 24 * 60 * 60 * 1000;
    const diffMs = now.getTime() - returnTime;

    let finalOverdueFee = 0;
    if (diffMs > gracePeriodMs) {
      const overdueDays = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
      const vehicle = await Vehicle.findById(booking.vehicle);
      const dailyRate = vehicle?.pricePerDay || (booking.totalPrice && booking.days ? Math.round(booking.totalPrice / booking.days) : 1000);
      finalOverdueFee = overdueDays * dailyRate;
    }

    // Mark as returned and record actual return date
    booking.status = 'returned';
    booking.actualReturnDate = now;
    booking.overdueFee = finalOverdueFee;
    await booking.save();

    // Mark vehicle available in fleet again
    const vehicle = await Vehicle.findById(booking.vehicle);
    if (vehicle) {
      vehicle.isAvailable = true;
      await vehicle.save();
    }

    res.status(200).json({
      success: true,
      message: finalOverdueFee > 0
        ? `Vehicle returned. Overdue charge of ₹${finalOverdueFee.toLocaleString('en-IN')} applied (returned past 24h grace period).`
        : 'Vehicle returned successfully!',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

module.exports = router;
