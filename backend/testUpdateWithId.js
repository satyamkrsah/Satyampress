const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const cat = await Category.findOne();
  console.log("Found cat:", cat.name);
  
  const payload = cat.toObject();
  if (payload.customizationFields.length > 0) {
    payload.customizationFields[0].name = "Updated Size Name";
  }

  const updated = await Category.findByIdAndUpdate(cat._id, payload, { new: true, runValidators: true });
  console.log("Updated fields:", JSON.stringify(updated.customizationFields, null, 2));
  process.exit(0);
});
