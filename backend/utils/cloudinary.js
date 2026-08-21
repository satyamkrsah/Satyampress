const cloudinary = require('cloudinary').v2;

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Not Loaded");

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

if (!cloudName || !apiKey || !apiSecret) {
  console.warn("⚠️ [Cloudinary] Warning: Missing or invalid Cloudinary credentials in environment variables.");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

module.exports = cloudinary;
