const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const cat = await Category.findOne();
  console.log("Found cat:", cat.name);
  
  const payload = {
    customizationFields: [
      {
        name: 'Test Field',
        type: 'Select',
        isRequired: true,
        options: [{ name: 'Opt 1', priceModifier: 10 }]
      }
    ]
  };

  const updated = await Category.findByIdAndUpdate(cat._id, payload, { new: true, runValidators: true });
  console.log("Updated fields:", JSON.stringify(updated.customizationFields, null, 2));
  process.exit(0);
});
