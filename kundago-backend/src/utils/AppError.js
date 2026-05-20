/**
 * Custom Application Error Class
 * Provides consistent error structure across the application
 */
export class AppError extends Error {
  /**
   * Create an AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} [code] - Optional error code for client handling
   */
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a 400 Bad Request error
   * @param {string} message - Error message
   * @param {string} [code] - Optional error code
   * @returns {AppError}
   */
  static badRequest(message, code = 'BAD_REQUEST') {
    return new AppError(message, 400, code);
  }

  /**
   * Create a 401 Unauthorized error
   * @param {string} message - Error message
   * @param {string} [code] - Optional error code
   * @returns {AppError}
   */
  static unauthorized(message = 'Not authenticated', code = 'UNAUTHORIZED') {
    return new AppError(message, 401, code);
  }

  /**
   * Create a 403 Forbidden error
   * @param {string} message - Error message
   * @param {string} [code] - Optional error code
   * @returns {AppError}
   */
  static forbidden(message = 'Access denied', code = 'FORBIDDEN') {
    return new AppError(message, 403, code);
  }

  /**
   * Create a 404 Not Found error
   * @param {string} message - Error message
   * @param {string} [code] - Optional error code
   * @returns {AppError}
   */
  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new AppError(message, 404, code);
  }

  /**
   * Create a 409 Conflict error
   * @param {string} message - Error message
   * @param {string} [code] - Optional error code
   * @returns {AppError}
   */
  static conflict(message, code = 'CONFLICT') {
    return new AppError(message, 409, code);
  }

  /**
   * Create a 422 Unprocessable Entity error
   * @param {string} message - Error message
   * @param {string} [code] - Optional error code
   * @returns {AppError}
   */
  static unprocessable(message, code = 'UNPROCESSABLE') {
    return new AppError(message, 422, code);
  }

  /**
   * Create a 500 Internal Server error
   * @param {string} message - Error message
   * @param {string} [code] - Optional error code
   * @returns {AppError}
   */
  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new AppError(message, 500, code);
  }

  /**
   * Create a 503 Service Unavailable error
   * @param {string} message - Error message
   * @param {string} [code] - Optional error code
   * @returns {AppError}
   */
  static serviceUnavailable(message = 'Service unavailable', code = 'SERVICE_UNAVAILABLE') {
    return new AppError(message, 503, code);
  }
}

/**
 * Validation Error Class
 * For handling input validation errors with field details
 */
export class ValidationError extends AppError {
  /**
   * Create a ValidationError
   * @param {string} message - Error message
   * @param {Array} errors - Array of field-level errors
   */
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }

  /**
   * Create from Joi validation error
   * @param {Object} joiError - Joi validation error object
   * @returns {ValidationError}
   */
  static fromJoi(joiError) {
    const errors = joiError.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, '')
    }));

    return new ValidationError('Validation failed', errors);
  }
}

export default AppError;
