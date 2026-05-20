import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';

/**
 * JWT Utility Functions
 * Handles token generation and verification for authentication
 */

/**
 * Generate a JWT token for a user
 * Token contains userId and role as per specification
 * @param {Object} payload - Token payload
 * @param {string} payload.userId - User's ID
 * @param {string} payload.role - User's role (USER or ADMIN)
 * @returns {string} Signed JWT token
 */
export const generateToken = (payload) => {
  const { userId, role } = payload;

  if (!userId || !role) {
    throw new Error('userId and role are required for token generation');
  }

  return jwt.sign(
    { userId, role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload (userId, role)
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Decode a JWT token without verification
 * Useful for reading token contents without validating signature
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) {
    return null;
  }

  return jwt.decode(token);
};

/**
 * Extract token from Authorization header
 * Expects format: "Bearer <token>"
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null if invalid format
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice(7); // Remove "Bearer " prefix
};

/**
 * Generate token for a user document
 * Convenience method that accepts a user object
 * @param {Object} user - User document
 * @param {string} user._id - User's ID
 * @param {string} user.role - User's role
 * @returns {string} Signed JWT token
 */
export const generateTokenForUser = (user) => {
  return generateToken({
    userId: user._id.toString(),
    role: user.role
  });
};

export default {
  generateToken,
  verifyToken,
  decodeToken,
  extractTokenFromHeader,
  generateTokenForUser
};
