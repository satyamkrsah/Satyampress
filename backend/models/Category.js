const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true,
      unique: true,
      maxlength: [50, 'Name can not be more than 50 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description can not be more than 500 characters']
    },
    image: {
      type: String,
      default: 'no-photo.jpg'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    parentCategory: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      default: null
    },
    seoTitle: {
      type: String,
      maxlength: 100
    },
    seoDescription: {
      type: String,
      maxlength: 300
    },
    seoKeywords: {
      type: String
    },
    slug: String,
    customizationFields: [{
      name: { type: String, required: true },
      type: { type: String, enum: ['Text', 'Number', 'Select', 'Radio', 'Checkbox', 'Color Picker', 'File Upload'], required: true },
      isRequired: { type: Boolean, default: false },
      options: [{
        name: { type: String, required: true },
        priceModifier: { type: Number, default: 0 }
      }]
    }]
  },
  {
    timestamps: true
  }
);

// Create slug from name
// CategorySchema.pre('save', function(next) {
//   this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
//   next();
// });

CategorySchema.pre('save', function () {
  if (this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

module.exports = mongoose.model('Category', CategorySchema);
