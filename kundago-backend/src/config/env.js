import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const env = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  
  // MongoDB
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kundago',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Wave
  waveApiKey: process.env.WAVE_API_KEY,
  waveWebhookSecret: process.env.WAVE_WEBHOOK_SECRET,
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Cloudinary
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  
  // Resend Email
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@kundago.com',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Helper methods
  isDevelopment() {
    return this.nodeEnv === 'development';
  },
  
  isProduction() {
    return this.nodeEnv === 'production';
  },
  
  isTest() {
    return this.nodeEnv === 'test';
  }
};

export default env;
