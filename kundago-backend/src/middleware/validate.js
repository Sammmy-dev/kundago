import { ValidationError } from '../utils/AppError.js';

/**
 * Validation Middleware Factory
 * Creates middleware that validates request data against a Joi schema
 * 
 * @param {Object} schema - Joi validation schema
 * @param {string} [source='body'] - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,       // Return all errors, not just the first
      stripUnknown: true,      // Remove unknown fields
      convert: true            // Convert types (e.g., string to number)
    });

    if (error) {
      const validationError = ValidationError.fromJoi(error);
      return res.status(400).json({
        success: false,
        message: validationError.message,
        code: validationError.code,
        errors: validationError.errors
      });
    }

    // Replace request data with validated & sanitized data
    req[source] = value;
    next();
  };
};

/**
 * Validate request body
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
export const validateBody = (schema) => validate(schema, 'body');

/**
 * Validate request query parameters
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
export const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate request URL parameters
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
export const validateParams = (schema) => validate(schema, 'params');

/**
 * Validate multiple sources at once
 * @param {Object} schemas - Object with keys 'body', 'query', 'params' containing Joi schemas
 * @returns {Function} Express middleware
 */
export const validateAll = (schemas) => {
  return (req, res, next) => {
    const allErrors = [];

    for (const [source, schema] of Object.entries(schemas)) {
      if (!schema) continue;

      const data = req[source];
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          field: `${source}.${detail.path.join('.')}`,
          message: detail.message.replace(/"/g, '')
        }));
        allErrors.push(...errors);
      } else {
        req[source] = value;
      }
    }

    if (allErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: allErrors
      });
    }

    next();
  };
};

export default {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateAll
};
