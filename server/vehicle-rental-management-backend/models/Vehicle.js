const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: [true, 'Vehicle make is required (e.g. Toyota, Honda)'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Vehicle model name is required (e.g. Camry, Civic)'],
      trim: true,
    },
    regNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: ['Car', 'Bike', 'SUV', 'Truck', 'Van'],
      default: 'Car',
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price must be positive'],
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
      default: 'Petrol',
    },
    seatingCapacity: {
      type: Number,
      default: 4,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    },
    description: {
      type: String,
      trim: true,
      default: 'Well maintained, inspected, and ready for rental.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
