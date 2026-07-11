const axios = require('axios');
(async () => {
  try {
    const res = await axios.put('http://localhost:5000/api/categories/6a4fefa9b049234a9653d5a9', {
      name: 'Wedding Cards',
      description: 'Premium wedding invitation card printing',
      status: 'active',
      customizationFields: [
        {
          name: 'Paper Type',
          type: 'Select',
          isRequired: true,
          options: [{ name: 'Matte', priceModifier: 15 }]
        }
      ]
    });
    console.log("Response:", JSON.stringify(res.data.data.customizationFields, null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
})();
