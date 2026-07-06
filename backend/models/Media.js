const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true
    },
    secureUrl: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    uploadType: {
      type: String,
      enum: ['design_file', 'product_image', 'admin_asset'],
      default: 'design_file'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Media', MediaSchema);
