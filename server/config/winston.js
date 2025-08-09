import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import path from 'path';
import config from './config.js';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure log directory exists
const fs = require('fs');
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.printf(
  ({ level, message, label, timestamp, ...meta }) => {
    return `${timestamp} [${label}] ${level}: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  }
);

// Define different colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston to add colors
winston.addColors(colors);

// Create the logger instance that will be used to log messages
const logger = winston.createLogger({
  level: config.logs.level,
  format: winston.format.combine(
    winston.format.label({ label: 'student-progress-tracker' }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'student-progress-tracker' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winstonDaily({
      level: 'error',
      dirname: path.join(logDir, 'error'),
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for 14 days
    }),
    // Write all logs with level `info` and below to `combined.log`
    new winstonDaily({
      level: 'info',
      dirname: path.join(logDir, 'combined'),
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // HTTP request logging
    new winstonDaily({
      level: 'http',
      dirname: path.join(logDir, 'http'),
      filename: 'http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
    }),
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

// If we're not in production, also log to the console with colors and a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.simple(),
        logFormat
      ),
    })
  );
}

// Create a stream for morgan to use with winston
const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Create a format for morgan
const morganFormat = ':method :url :status :res[content-length] - :response-time ms';

// Create a stream for morgan to use with winston
const morganOptions = {
  stream,
  skip: (req) => {
    // Skip logging for health checks
    return req.originalUrl === '/health';
  },
};

export { logger, stream, morganFormat, morganOptions };
