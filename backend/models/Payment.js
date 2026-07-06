const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true
    },
    razorpayPaymentId: {
      type: String
    },
    signature: {
      type: String
    },
    order: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
      required: true
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'online', 'card', 'upi', 'netbanking', 'wallet'],
      default: 'online'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    refundStatus: {
      type: String,
      enum: ['none', 'partial', 'full'],
      default: 'none'
    },
    transactionTime: {
      type: Date
    },
    errorDetails: {
      code: String,
      description: String,
      source: String,
      step: String,
      reason: String
    }
  },
  {
    timestamps: true
  }
);

// Generate custom paymentId before save if not present
PaymentSchema.pre('save', function(next) {
  if (!this.paymentId) {
    this.paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

PaymentSchema.index({ order: 1 });
PaymentSchema.index({ customer: 1 });
PaymentSchema.index({ paymentStatus: 1 });
PaymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
