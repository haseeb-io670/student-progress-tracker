import winston from 'winston';
import path from 'path';
import config from '../config/config.js';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${timestamp} [${level}]: ${message}${metaString}`;
});

// Define different formats for console and file
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  logFormat
);

const fileFormat = combine(
  timestamp(),
  json()
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logs.level,
  format: fileFormat,
  defaultMeta: { service: 'student-progress-tracker' },
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to 'combined.log'
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

// If we're not in production, also log to the console
if (config.isDevelopment) {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Create a stream for morgan (HTTP request logging)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Add request logging middleware
export const requestLogger = (req, res, next) => {
  // Skip logging for health checks
  if (req.path === '/health') {
    return next();
  }

  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${duration}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
    };

    if (res.statusCode >= 400) {
      logger.error(`${req.method} ${req.originalUrl} - ${res.statusCode} in ${duration}ms`, logData);
    } else {
      logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode} in ${duration}ms`, logData);
    }
  });

  next();
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Recommended: send the information to your error tracking service
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Recommended: send the information to your error tracking service
  // Consider whether to restart the process
  // process.exit(1);
});

export { logger };
