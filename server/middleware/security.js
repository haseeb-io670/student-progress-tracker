import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { rateLimiter as redisRateLimit } from './rateLimit.js';
import config from '../config/config.js';

// Security middleware configuration
export const securityMiddleware = [
  // Set security HTTP headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
        ],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tile.openstreetmap.org',
          'https://*.googleapis.com',
          'https://*.gstatic.com',
        ],
        connectSrc: [
          "'self'",
          'https://*.tile.openstreetmap.org',
          'https://*.googleapis.com',
          'https://*.gstatic.com',
          'ws://localhost:*', // For development
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
          'data:',
        ],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for some CDNs
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: { allow: true },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  }),

  // Rate limiting
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Too many requests, please try again later.',
    },
    // Use Redis for distributed rate limiting in production
    store: config.redis.enabled ? redisRateLimit : undefined,
  }),

  // Prevent HTTP Parameter Pollution
  (req, res, next) => {
    // Remove duplicate parameters
    for (const key in req.query) {
      if (Array.isArray(req.query[key])) {
        req.query[key] = req.query[key][0];
      }
    }
    next();
  },

  // Add security headers
  (req, res, next) => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Disable content type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Set Referrer-Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Set Permissions-Policy
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()'
    );
    
    // Set X-Permitted-Cross-Domain-Policies
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    
    next();
  },
];

// Export individual middleware for specific routes
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
