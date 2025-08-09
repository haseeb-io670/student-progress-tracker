/**
 * Success response handler
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data = null, message = 'Operation successful', statusCode = 200) => {
  const response = {
    status: 'success',
    message,
    ...(data && { data })
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Error response handler
 * @param {Object} res - Express response object
 * @param {string|Error} error - Error message or Error object
 * @param {string} type - Error type (e.g., 'ValidationError', 'NotFound')
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {Object} details - Additional error details
 */
const errorResponse = (res, error, type = 'Error', statusCode = 400, details = {}) => {
  const message = error instanceof Error ? error.message : error;
  
  const response = {
    status: 'error',
    error: {
      type,
      message,
      ...details
    }
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Not found response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 'NotFound', 404);
};

/**
 * Validation error response handler
 * @param {Object} res - Express response object
 * @param {string|Object} errors - Validation errors
 */
const validationErrorResponse = (res, errors) => {
  return errorResponse(
    res, 
    'Validation failed', 
    'ValidationError', 
    422, 
    { errors: typeof errors === 'string' ? [errors] : errors }
  );
};

/**
 * Unauthorized response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return errorResponse(res, message, 'Unauthorized', 401);
};

/**
 * Forbidden response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
  return errorResponse(res, message, 'Forbidden', 403);
};

/**
 * Server error response handler
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
const serverErrorResponse = (res, error) => {
  console.error('Server Error:', error);
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;
  
  return errorResponse(
    res, 
    message, 
    'ServerError', 
    500, 
    process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}
  );
};

export {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse
};
