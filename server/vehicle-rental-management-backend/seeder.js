const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');

const seedData = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in .env');
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { dbName: 'vehicle_rental' });
    console.log('Connected to database.');

    // Only wipe if explicitly passed '--reset' flag
    const shouldReset = process.argv.includes('--reset');

    if (shouldReset) {
      console.log('Reset flag provided: clearing existing records...');
      await Booking.deleteMany({});
      await Vehicle.deleteMany({});
      await User.deleteMany({});
      console.log('Database cleared.');
    } else {
      console.log('Preserving existing database records (Safe Mode)...');
    }

    // 1. Seed or Preserve Users
    let adminUser = await User.findOne({ email: 'admin@rental.com' });
    if (!adminUser) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@rental.com',
        phone: '9876543210',
        address: '100 Fleet Headquarters, Koramangala, Bengaluru, Karnataka 560034',
        password: adminPassword,
        role: 'admin',
      });
      console.log('Created default Admin user.');
    } else {
      if (!adminUser.address) {
        adminUser.address = '100 Fleet Headquarters, Koramangala, Bengaluru, Karnataka 560034';
        await adminUser.save();
      }
      console.log('Admin user already exists. Preserving.');
    }

    let standardUser = await User.findOne({ email: 'john@example.com' });
    if (!standardUser) {
      const userPassword = await bcrypt.hash('user123', 10);
      standardUser = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9123456780',
        address: '42 MG Road, Indiranagar, Bengaluru, Karnataka 560038',
        password: userPassword,
        role: 'user',
      });
      console.log('Created default Demo user.');
    } else {
      if (!standardUser.address) {
        standardUser.address = '42 MG Road, Indiranagar, Bengaluru, Karnataka 560038';
        await standardUser.save();
      }
      console.log('Demo user already exists. Preserving.');
    }

    // 2. Seed Default Vehicles without overwriting existing custom vehicles
    const defaultVehicles = [
      {
        make: 'Maruti Suzuki',
        name: 'WagonR 2021',
        regNumber: 'WB74BG8329',
        type: 'Car',
        pricePerDay: 1200,
        fuelType: 'Petrol',
        seatingCapacity: 5,
        isAvailable: true,
        image: 'https://plain-apac-prod-public.komododecks.com/202611/14/aZUGCd32clyeAcYUEVkx/image.png',
        description: 'Popular tall-boy hatchback, extremely fuel-efficient and spacious for city commutes.',
      },
      {
        make: 'Toyota',
        name: 'Camry',
        regNumber: 'KA-01-AB-1001',
        type: 'Car',
        pricePerDay: 3500,
        fuelType: 'Hybrid',
        seatingCapacity: 5,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=600&q=80',
        description: 'Reliable and fuel-efficient executive sedan with modern safety assist.',
      },
      {
        make: 'Tesla',
        name: 'Model 3',
        regNumber: 'MH-02-CD-2002',
        type: 'Car',
        pricePerDay: 6500,
        fuelType: 'Electric',
        seatingCapacity: 5,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=600&q=80',
        description: 'All-electric performance sedan with autopilot features and premium interior.',
      },
      {
        make: 'Hyundai',
        name: 'Tucson',
        regNumber: 'DL-03-EF-3003',
        type: 'SUV',
        pricePerDay: 2800,
        fuelType: 'Diesel',
        seatingCapacity: 5,
        isAvailable: false,
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
        description: 'Comfortable family SUV with panoramic sunroof and spacious boot capacity.',
      },
      {
        make: 'Royal Enfield',
        name: 'Classic 350',
        regNumber: 'HR-26-GH-4004',
        type: 'Bike',
        pricePerDay: 850,
        fuelType: 'Petrol',
        seatingCapacity: 2,
        isAvailable: false,
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
        description: 'Timeless cruiser motorcycle, ideal for highway touring and city commuting.',
      },
      {
        make: 'Ford',
        name: 'F-150',
        regNumber: 'RJ-14-JK-5005',
        type: 'Truck',
        pricePerDay: 4500,
        fuelType: 'Diesel',
        seatingCapacity: 4,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=600&q=80',
        description: 'Heavy duty utility truck for long distance trips and cargo hauling.',
      },
      {
        make: 'Honda',
        name: 'Activa 6G',
        regNumber: 'UP-16-LM-6006',
        type: 'Bike',
        pricePerDay: 450,
        fuelType: 'Petrol',
        seatingCapacity: 2,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
        description: 'Lightweight, nimble scooter suitable for quick city rides.',
      },
    ];

    for (const v of defaultVehicles) {
      const exists = await Vehicle.findOne({ regNumber: v.regNumber });
      if (!exists) {
        await Vehicle.create(v);
        console.log(`Added missing vehicle: ${v.make} ${v.name} (${v.regNumber})`);
      }
    }

    // 3. Seed Sample Bookings (including active, past due, and overdue bookings)
    const tucsonVehicle = await Vehicle.findOne({ regNumber: 'DL-03-EF-3003' });
    const classicVehicle = await Vehicle.findOne({ regNumber: 'HR-26-GH-4004' });
    const now = new Date();
    let existingTucsonBooking = null;
    let existingClassicBooking = null;

    if (standardUser && tucsonVehicle) {
      // Overdue Booking 1: 4 days past due date (Tucson @ ₹2,800/day)
      const returnDate1 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
      const bookingDate1 = new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000);
      const days1 = 5;
      const overdueDays1 = 4;
      const overdueFee1 = overdueDays1 * tucsonVehicle.pricePerDay; // ₹11,200

      existingTucsonBooking = await Booking.findOne({ vehicle: tucsonVehicle._id, user: standardUser._id });
      if (!existingTucsonBooking) {
        existingTucsonBooking = new Booking({
          user: standardUser._id,
          vehicle: tucsonVehicle._id,
          bookingDate: bookingDate1,
          returnDate: returnDate1,
          days: days1,
          totalPrice: tucsonVehicle.pricePerDay * days1,
          deliveryAddress: '42 MG Road, Indiranagar, Bengaluru, Karnataka 560038',
          overdueFee: overdueFee1,
          status: 'overdue',
          paymentStatus: 'paid',
          paymentMethod: 'UPI (john.doe@okaxis)',
          paymentId: `pay_sim_${Date.now()}_tucson`,
          orderId: `order_sim_${Date.now()}_tucson`,
        });
      } else {
        existingTucsonBooking.bookingDate = bookingDate1;
        existingTucsonBooking.returnDate = returnDate1;
        existingTucsonBooking.days = days1;
        existingTucsonBooking.deliveryAddress = '42 MG Road, Indiranagar, Bengaluru, Karnataka 560038';
        existingTucsonBooking.status = 'overdue';
        existingTucsonBooking.overdueFee = overdueFee1;
      }
      await existingTucsonBooking.save();
      tucsonVehicle.isAvailable = false;
      await tucsonVehicle.save();
      console.log(`Seeded Tucson overdue booking (4 days late, overdue fee: ₹${overdueFee1.toLocaleString('en-IN')}).`);
    }

    if (standardUser && classicVehicle) {
      // Overdue Booking 2: 6 days past due date (Royal Enfield @ ₹850/day)
      const returnDate2 = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      const bookingDate2 = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000);
      const days2 = 6;
      const overdueDays2 = 6;
      const overdueFee2 = overdueDays2 * classicVehicle.pricePerDay; // ₹5,100

      existingClassicBooking = await Booking.findOne({ vehicle: classicVehicle._id, user: standardUser._id });
      if (!existingClassicBooking) {
        existingClassicBooking = new Booking({
          user: standardUser._id,
          vehicle: classicVehicle._id,
          bookingDate: bookingDate2,
          returnDate: returnDate2,
          days: days2,
          totalPrice: classicVehicle.pricePerDay * days2,
          deliveryAddress: 'Flat 204, Green Heights, 100ft Road, Indiranagar, Bengaluru',
          overdueFee: overdueFee2,
          status: 'overdue',
          paymentStatus: 'paid',
          paymentMethod: 'Card (ends in 4092)',
          paymentId: `pay_sim_${Date.now()}_classic`,
          orderId: `order_sim_${Date.now()}_classic`,
        });
      } else {
        existingClassicBooking.bookingDate = bookingDate2;
        existingClassicBooking.returnDate = returnDate2;
        existingClassicBooking.days = days2;
        existingClassicBooking.deliveryAddress = 'Flat 204, Green Heights, 100ft Road, Indiranagar, Bengaluru';
        existingClassicBooking.status = 'overdue';
        existingClassicBooking.overdueFee = overdueFee2;
      }
      await existingClassicBooking.save();
      classicVehicle.isAvailable = false;
      await classicVehicle.save();
      console.log(`Seeded Classic 350 overdue booking (6 days late, overdue fee: ₹${overdueFee2.toLocaleString('en-IN')}).`);
    }

    // 4. Seed sample notifications for Admin
    const Notification = require('./models/Notification');
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      await Notification.create([
        {
          type: 'new_booking',
          title: 'New Booking Received',
          message: 'John Doe booked Hyundai Tucson (DL-03-EF-3003) for 5 day(s).',
          booking: existingTucsonBooking?._id,
          customerName: 'John Doe',
          vehicleName: 'Hyundai Tucson',
          deliveryAddress: '42 MG Road, Indiranagar, Bengaluru, Karnataka 560038',
          isRead: false,
          createdAt: new Date(now.getTime() - 25 * 60 * 1000),
        },
        {
          type: 'new_booking',
          title: 'New Booking Received',
          message: 'John Doe booked Royal Enfield Classic 350 (HR-26-GH-4004) for 6 day(s).',
          booking: existingClassicBooking?._id,
          customerName: 'John Doe',
          vehicleName: 'Royal Enfield Classic 350',
          deliveryAddress: 'Flat 204, Green Heights, 100ft Road, Indiranagar, Bengaluru',
          isRead: false,
          createdAt: new Date(now.getTime() - 5 * 60 * 1000),
        },
      ]);
      console.log('Seeded sample Admin notifications.');
    }

    console.log('Seeder completed safely without deleting existing user data!');
    process.exit(0);
  } catch (error) {
    console.error('Error with data seeding:', error.message);
    process.exit(1);
  }
};

seedData();
