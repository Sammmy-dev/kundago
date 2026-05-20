import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';
import { logger } from './index.js';

/**
 * Configure Cloudinary with environment variables
 */
const configureCloudinary = () => {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    logger.warn('Cloudinary credentials not found in environment variables');
    return false;
  }

  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true
  });

  logger.info('Cloudinary configured successfully');
  return true;
};

// Initialize configuration
const isConfigured = configureCloudinary();

export { cloudinary, isConfigured };
export default cloudinary;
