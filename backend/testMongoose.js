const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
  name: String,
  customizationFields: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['Select', 'Text'], required: true },
    options: [{ name: String, priceModifier: Number }]
  }]
});
const Category = mongoose.model('CategoryTest', CategorySchema);
const doc = new Category({
  name: 'Test',
  customizationFields: [{ name: 'Paper', type: 'Select', options: [{ name: 'A4', priceModifier: 0 }] }]
});
console.log(JSON.stringify(doc.toObject(), null, 2));
