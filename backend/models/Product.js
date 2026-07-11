const mongoose = require('mongoose');

const CustomizationOptionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'A4', '300 GSM', 'Glossy'
  priceModifier: { type: Number, default: 0 }, // Additional cost for this option
  isAvailable: { type: Boolean, default: true }
});

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [100, 'Name can not be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    basePrice: {
      type: Number,
      required: [true, 'Please add a base price']
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true
    },
    thumbnail: {
      type: mongoose.Schema.ObjectId,
      ref: 'Media'
    },
    gallery: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Media'
    }],
    pdfSample: {
      type: mongoose.Schema.ObjectId,
      ref: 'Media'
    },
    inStock: {
      type: Boolean,
      default: true
    },
    stockCount: {
      type: Number,
      default: 0
    },
    gstRate: {
      type: Number,
      default: 18,
    },
    // Inventory Management
    stock: {
      type: Number,
      required: true,
      default: 100
    },
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    productCode: {
      type: String
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    // End Inventory Management
    isActive: {
      type: Boolean,
      default: true,
    },
    showInMainCatalog: {
      type: Boolean,
      default: true
    },

    showInMainCatalog: {
  type: Boolean,
  default: true
},
    collectionType: {
      type: String,
      enum: ['none', 'premium', 'bestSeller', 'newArrival', 'featured'],
      default: 'none'
    },
    // Printing Customizations
    customizations: {
      paperSizes: [CustomizationOptionSchema],
      paperGsm: [CustomizationOptionSchema],
      paperTypes: [CustomizationOptionSchema],
      colorOptions: [CustomizationOptionSchema], // Single side color, Double side color, B/W
      lamination: [CustomizationOptionSchema], // Gloss, Matte, None
      cornerFinish: [CustomizationOptionSchema], // Standard, Rounded
      binding: [CustomizationOptionSchema], // Spiral, Wiro, Hardcover, Perfect
    },
    minQuantity: {
      type: Number,
      default: 1
    },
    deliveryDays: {
      type: Number,
      default: 3
    },
    offerPrice: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', ProductSchema);
