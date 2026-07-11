const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const cats = await Category.find();
  console.log("Categories customizationFields:", JSON.stringify(cats.map(c => c.customizationFields), null, 2));
  process.exit(0);
});
