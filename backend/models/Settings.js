const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'Satyam Printing Press' },
    logo: { type: String, default: '' },
    address: { type: String, default: '123 Print Street, Creative City' },
    phone: { type: String, default: '+91 9876543210' },
    email: { type: String, default: 'support@satyampress.com' },
    gstNumber: { type: String, default: '' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' }
    },
    googleMapsUrl: { type: String, default: '' },
    businessHours: { type: String, default: 'Mon-Sat: 9 AM - 8 PM' },
    seo: {
      defaultTitle: { type: String, default: 'Satyam Printing Press' },
      defaultDescription: { type: String, default: 'Premium Printing Services' },
      defaultKeywords: { type: String, default: 'printing, press' }
    }
  },
  {
    timestamps: true
  }
);

// We will typically only have ONE settings document in the collection
module.exports = mongoose.model('Settings', SettingsSchema);
