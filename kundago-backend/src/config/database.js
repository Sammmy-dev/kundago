import mongoose from 'mongoose';
import env from './env.js';
import logger from './logger.js';

/**
 * MongoDB connection configuration options
 */
const connectionOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

/**
 * Connect to MongoDB database
 * @returns {Promise<typeof mongoose>} Mongoose connection instance
 */
const connectDatabase = async () => {
  try {
    // Validate connection string exists
    if (!env.mongodbUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    logger.info('Connecting to MongoDB...');

    // Connect to MongoDB
    const connection = await mongoose.connect(env.mongodbUri, connectionOptions);

    logger.info(`MongoDB connected successfully`);
    logger.info(`  Host: ${connection.connection.host}`);
    logger.info(`  Database: ${connection.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    return connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Gracefully disconnect from MongoDB
 * @returns {Promise<void>}
 */
const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

/**
 * Get current database connection state
 * @returns {string} Connection state description
 */
const getConnectionState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

export { connectDatabase, disconnectDatabase, getConnectionState };
export default { connectDatabase, disconnectDatabase, getConnectionState };
