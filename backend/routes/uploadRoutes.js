const express = require('express');
const multer = require('multer');
const {
  uploadFile,
  getMediaFiles,
  deleteMediaFile
} = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer memory storage configuration
const storage = multer.memoryStorage();

// File filter (PDF, PNG, JPG, JPEG, SVG)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/svg+xml'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PNG, JPG, JPEG, and SVG are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// Routes
router.route('/')
  .post(protect, upload.single('file'), uploadFile)
  .get(protect, authorize('admin'), getMediaFiles);

router.route('/:id')
  .delete(protect, deleteMediaFile);

module.exports = router;
