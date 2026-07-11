const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
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
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true // Calculated price based on base price + customizations
  },
  designFile: {
    type: mongoose.Schema.ObjectId,
    ref: 'Media'
  },
  specialInstructions: String,
  // Storing the selected customization options
  customizations: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    items: [CartItemSchema],
    coupon: {
      type: mongoose.Schema.ObjectId,
      ref: 'Coupon',
      default: null
    },
    subTotal: {
      type: Number,
      default: 0
    },
    taxTotal: {
      type: Number,
      default: 0
    },
    shippingTotal: {
      type: Number,
      default: 0
    },
    discountTotal: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);



module.exports = mongoose.model('Cart', CartSchema);
