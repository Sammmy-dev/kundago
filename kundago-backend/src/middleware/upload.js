import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary, { isConfigured } from '../config/cloudinary.js';
import { logger } from '../config/index.js';

/**
 * File filter to accept only images
 */
const imageFileFilter = (req, file, cb) => {
  // Allowed mime types
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.'
      ),
      false
    );
  }
};

/**
 * Create Cloudinary storage for user profile images
 */
const userProfileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'users/profile-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit', quality: 70 }]
  }
});

/**
 * Create Cloudinary storage for product images
 */
const productImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 70 }]
  }
});

/**
 * Multer upload middleware for user profile images
 * - Single file upload
 * - Max size: 5MB
 * - Only images allowed
 */
export const uploadUserProfile = multer({
  storage: userProfileStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single('profileImage');

/**
 * Multer upload middleware for product images
 * - Multiple file upload (up to 5 images)
 * - Max size: 5MB per file
 * - Only images allowed
 */
export const uploadProductImages = multer({
  storage: productImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 files
  }
}).array('productImages', 5);

/**
 * Error handling middleware for Multer errors
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error('Multer error:', { error: err.message, code: err.code });

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files.'
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "profileImage" or "productImages".'
      });
    }

    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }

  if (err) {
    logger.error('Upload error:', { error: err.message });
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }

  next();
};

/**
 * Middleware to check if Cloudinary is configured
 */
export const requireCloudinaryConfig = (req, res, next) => {
  if (!isConfigured) {
    logger.error('Cloudinary not configured');
    return res.status(500).json({
      success: false,
      message: 'Image upload service not configured. Please contact support.'
    });
  }
  next();
};

export default {
  uploadUserProfile,
  uploadProductImages,
  handleUploadError,
  requireCloudinaryConfig
};
