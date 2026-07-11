const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const cat = await Category.findOne();
  console.log("Before:", cat);
  if (cat) {
    cat.customizationFields = [{ name: 'Test', type: 'Text' }];
    await cat.save();
    const updated = await Category.findById(cat._id);
    console.log("After:", updated);
  }
  process.exit(0);
});
