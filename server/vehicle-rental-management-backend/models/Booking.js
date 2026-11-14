const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    bookingDate: {
      type: Date,
      required: [true, 'Booking start date is required'],
      default: Date.now,
    },
    returnDate: {
      type: Date,
      required: [true, 'Return date is required'],
    },
    actualReturnDate: {
      type: Date,
    },
    days: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'returned', 'overdue'],
      default: 'active',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'refunded'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      default: 'UPI',
    },
    paymentId: {
      type: String,
    },
    orderId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
