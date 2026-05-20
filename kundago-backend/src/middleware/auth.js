import { verifyToken, extractTokenFromHeader } from '../utils/index.js';
import { logger } from '../config/index.js';

/**
 * Authentication Middleware
 * Validates JWT token from Authorization header
 * Attaches user info (userId, role) to req.user
 */
export const requireAuth = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    logger.warn(`Authentication failed: ${error.message}`, {
      ip: req.ip,
      path: req.originalUrl
    });

    // Handle specific JWT errors
    if (error.message === 'Token has expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

/**
 * Role Authorization Middleware Factory
 * Creates middleware that checks if user has required role
 * Must be used AFTER requireAuth middleware
 * @param {...string} allowedRoles - Roles allowed to access the route
 * @returns {Function} Express middleware function
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure requireAuth was called first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Access denied for role: ${req.user.role}`, {
        userId: req.user.userId,
        requiredRoles: allowedRoles,
        path: req.originalUrl
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Convenience middleware for admin-only routes
 * Combines requireAuth and requireRole('ADMIN')
 */
export const requireAdmin = [requireAuth, requireRole('ADMIN')];

export default {
  requireAuth,
  requireRole,
  requireAdmin
};
