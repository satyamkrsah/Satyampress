const express = require('express');
const multer = require('multer');
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  updatePassword,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  uploadProfileImage,
  deleteProfileImage
} = require('../controllers/authController');

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Multer memory storage configuration for avatars
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.'), false);
  }
};
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

router.route('/profile-image')
  .post(protect, upload.single('image'), uploadProfileImage)
  .delete(protect, deleteProfileImage);

router.route('/wishlist')
  .get(protect, getWishlist)
  .post(protect, addToWishlist);

router.delete('/wishlist/:productId', protect, removeFromWishlist);

module.exports = router;
