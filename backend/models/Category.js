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
  },
  {
    timestamps: true
  }
);

// Create slug from name
CategorySchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
