class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  // Default to 500 if status code not provided
  statusCode = statusCode || 500;
  
  // In production, don't leak error details
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Log error for debugging
  console.error(err);

  res.status(statusCode).json(response);
};

// Catch 404 and forward to error handler
const notFound = (req, res, next) => {
  const error = new ApiError(404, 'Not Found');
  next(error);
};

// Handle unhandled promise rejections
const handleRejection = (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider adding error reporting service here
};

// Handle uncaught exceptions
const handleException = (error) => {
  console.error('Uncaught Exception:', error);
  // Consider adding error reporting service here
  process.exit(1); // Exit with failure
};

// Handle unhandled promise rejections
process.on('unhandledRejection', handleRejection);

// Handle uncaught exceptions
process.on('uncaughtException', handleException);

export {
  ApiError,
  errorHandler,
  notFound,
  handleRejection,
  handleException
};
