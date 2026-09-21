const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');
const Media = require('../models/Media');

// @desc    Generate Cloudinary upload signature for client-side uploads
// @route   GET /api/upload/signature
// @access  Private
exports.getSignature = (req, res) => {
  try {
    // 1. Timestamp Drift Fix: Generate timestamp ONCE on the backend
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Strictly enforce the folder name as required
    const folder = `satyampress/design_file`;

    const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();
    const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
    const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();

    if (!apiSecret || !cloudName || !apiKey) {
      console.error("🚨 [Cloudinary API] Server misconfiguration: Credentials missing or invalid.");
      return res.status(500).json({ success: false, error: "Server upload configuration error." });
    }

    // 2. Payload Exclusion Fix: Do NOT include 'file' or 'api_key' in paramsToSign
    const paramsToSign = {
      folder: folder,
      timestamp: timestamp,
    };

    // Safe debugging log (NEVER logs the API secret itself)
    console.log("[Cloudinary Debug] Generating Signature");
    console.log(`- Folder: ${folder}`);
    console.log(`- Timestamp: ${timestamp}`);
    console.log(`- Cloud Name: ${cloudName}`);
    console.log(`- API Key: ${apiKey}`);
    console.log(`- API Secret Present: ${!!apiSecret} (Length: ${apiSecret.length})`);
    
    // 3. SDK Signature Method Fix: Use official SDK method for automatic alphabetical sorting
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret
    );

    res.status(200).json({
      success: true,
      signature,
      timestamp,
      folder,
      cloudName: cloudName,
      apiKey: apiKey
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Save media metadata after client-side Cloudinary upload
// @route   POST /api/upload/metadata
// @access  Private
exports.saveMetadata = async (req, res) => {
  try {
    const { publicId, secureUrl, originalName, mimeType, size, uploadType } = req.body;

    const media = await Media.create({
      publicId,
      secureUrl,
      originalName,
      mimeType,
      size,
      uploadedBy: req.user.id,
      uploadType: uploadType || 'design_file'
    });

    res.status(201).json({
      success: true,
      data: media
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Upload file to Cloudinary and store metadata
// @route   POST /api/upload
// @access  Private
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const { uploadType } = req.body; // e.g., 'design_file', 'product_image'
    
    // File validation is handled by multer middleware, but we can do extra checks here
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;
    const originalName = req.file.originalname;

    let resourceType = 'auto';
    if (mimeType === 'application/pdf') {
      resourceType = 'raw'; // Cloudinary best practice for PDFs
    } else if (mimeType.startsWith('image/')) {
      resourceType = 'image';
    }

    // Stream upload to Cloudinary
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          {
            folder: `satyampress/${uploadType || 'misc'}`,
            resource_type: resourceType
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    // Save metadata to MongoDB
    const media = await Media.create({
      publicId: result.public_id,
      secureUrl: result.secure_url,
      originalName: originalName,
      mimeType: mimeType,
      size: fileSize,
      uploadedBy: req.user.id,
      uploadType: uploadType || 'design_file'
    });

    res.status(201).json({
      success: true,
      data: media
    });

  } catch (err) {
    console.error('Upload Error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get current user's media files
// @route   GET /api/upload/myuploads
// @access  Private
exports.getMyMediaFiles = async (req, res) => {
  try {
    const files = await Media.find({ uploadedBy: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all media files (Admin)
// @route   GET /api/upload
// @access  Private/Admin
exports.getMediaFiles = async (req, res, next) => {
  try {
    const media = await Media.find()
      .populate('uploadedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: media
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete media file
// @route   DELETE /api/upload/:id
// @access  Private (Admin or Owner)
exports.deleteMediaFile = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    // Authorize admin or owner
    if (media.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
       return res.status(401).json({ success: false, error: 'Not authorized to delete this file' });
    }

    // Determine resource type for Cloudinary deletion
    let resourceType = 'image';
    if (media.mimeType === 'application/pdf') {
      resourceType = 'raw';
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(media.publicId, { resource_type: resourceType });

    // Delete from MongoDB
    await media.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
