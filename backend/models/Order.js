const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  image: {
    type: String
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  gstRate: {
    type: Number,
    default: 18
  },
  designFile: {
    type: mongoose.Schema.ObjectId,
    ref: 'Media'
  },
  specialInstructions: String,
  customizations: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    items: [OrderItemSchema],
    shippingAddress: {
      type: mongoose.Schema.ObjectId,
      ref: 'Address',
      required: true
    },
    billingAddress: {
      type: mongoose.Schema.ObjectId,
      ref: 'Address',
      required: true
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cod', 'online']
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'printing', 'ready_for_dispatch', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending'
    },
    timeline: [
      {
        status: String,
        note: String,
        date: { type: Date, default: Date.now }
      }
    ],
    adminNotes: String,
    customerNotes: String,
    estimatedDeliveryDate: Date,
    coupon: {
      type: mongoose.Schema.ObjectId,
      ref: 'Coupon',
      default: null
    },
    subTotal: {
      type: Number,
      required: true
    },
    taxTotal: {
      type: Number,
      required: true
    },
    shippingTotal: {
      type: Number,
      required: true
    },
    discountTotal: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true
    },
    orderNotes: String,
    invoiceNumber: {
      type: String,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

OrderSchema.index({ user: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
