const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Helper to convert webpage/sharing links to direct image links
const resolveImageUrl = async (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return undefined;
  let url = rawUrl.trim();
  if (!url) return undefined;

  // 1. Google Drive view link -> direct image link
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }

  // 2. Imgur page link -> direct image link
  if (url.includes('imgur.com/') && !url.includes('i.imgur.com')) {
    const match = url.match(/imgur\.com\/([a-zA-Z0-9]+)/);
    if (match) return `https://i.imgur.com/${match[1]}.png`;
  }

  // 3. Kommodo page link -> extract actual hosted image
  if (url.includes('kommodo.ai/i/')) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await response.text();
      const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (ogMatch && ogMatch[1]) {
        return ogMatch[1];
      }
    } catch (err) {
      console.error('Error resolving Kommodo image URL:', err.message);
    }
  }

  return url;
};

// 1. GET ALL VEHICLES (Public)
// Route: GET /api/vehicles
router.get('/', async (req, res) => {
  try {
    const { type, available, search } = req.query;
    let filter = {};

    if (type && type !== 'All') {
      filter.type = type;
    }
    if (available !== undefined && available !== '' && available !== 'All') {
      filter.isAvailable = available === 'true' || available === 'Available';
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { regNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
});

// 2. GET SINGLE VEHICLE BY ID (Public)
// Route: GET /api/vehicles/:id
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
});

// 3. CREATE NEW VEHICLE (Admin Only)
// Route: POST /api/vehicles
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { make, name, regNumber, type, pricePerDay, image, fuelType, seatingCapacity, description } = req.body;

    if (!make || !name || !regNumber || !pricePerDay) {
      return res.status(400).json({
        success: false,
        message: 'Make, Model Name, Registration Number, and Price Per Day are required.',
      });
    }

    // Check duplicate registration number
    const existing = await Vehicle.findOne({ regNumber: regNumber.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A vehicle with registration number ${regNumber.toUpperCase()} already exists.`,
      });
    }

    const resolvedImage = await resolveImageUrl(image);

    const newVehicle = new Vehicle({
      make: make.trim(),
      name: name.trim(),
      regNumber: regNumber.trim().toUpperCase(),
      type: type || 'Car',
      pricePerDay: Number(pricePerDay),
      image: resolvedImage || undefined,
      fuelType: fuelType || 'Petrol',
      seatingCapacity: Number(seatingCapacity) || 4,
      description: description || undefined,
    });

    const savedVehicle = await newVehicle.save();
    res.status(201).json({ success: true, data: savedVehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 4. UPDATE VEHICLE DETAILS (Admin Only)
// Route: PUT /api/vehicles/:id
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    if (req.body.regNumber) {
      req.body.regNumber = req.body.regNumber.toUpperCase();
    }
    if (req.body.image) {
      req.body.image = await resolveImageUrl(req.body.image);
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.status(200).json({ success: true, data: updatedVehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 5. DELETE VEHICLE (Admin Only)
// Route: DELETE /api/vehicles/:id
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deletedVehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
});

// 6. TOGGLE VEHICLE AVAILABILITY (Admin Only)
// Route: PATCH /api/vehicles/:id/toggle-availability
router.patch('/:id/toggle-availability', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    vehicle.isAvailable = !vehicle.isAvailable;
    await vehicle.save();

    res.status(200).json({
      success: true,
      message: `Vehicle marked as ${vehicle.isAvailable ? 'available' : 'unavailable'} for rental.`,
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
