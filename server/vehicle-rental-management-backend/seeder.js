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

    console.log('Seeder completed safely without deleting existing user data!');
    process.exit(0);
  } catch (error) {
    console.error('Error with data seeding:', error.message);
    process.exit(1);
  }
};

seedData();
