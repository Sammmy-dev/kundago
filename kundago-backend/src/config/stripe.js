import Stripe from 'stripe';
import env from './env.js';
import { logger } from './index.js';

/**
 * Stripe Configuration
 * Initializes Stripe client with secret key from environment
 */

let stripe = null;

/**
 * Initialize Stripe client
 * @returns {Stripe|null} Stripe instance or null if not configured
 */
const initializeStripe = () => {
  if (!env.stripeSecretKey) {
    logger.warn('Stripe secret key not found in environment variables');
    return null;
  }

  stripe = new Stripe(env.stripeSecretKey, {
    apiVersion: '2024-12-18.acacia'
  });

  logger.info('Stripe initialized successfully');
  return stripe;
};

/**
 * Get Stripe instance
 * @returns {Stripe|null} Stripe instance
 */
const getStripe = () => {
  if (!stripe) {
    return initializeStripe();
  }
  return stripe;
};

/**
 * Check if Stripe is configured
 * @returns {boolean} True if Stripe secret key exists
 */
const isStripeConfigured = () => {
  return !!env.stripeSecretKey;
};

// Initialize on module load
initializeStripe();

export { getStripe, isStripeConfigured };
export default stripe;
