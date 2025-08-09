import { createClient } from 'redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import config from '../config/config.js';
import { logger } from '../utils/logger.js';

let rateLimiterRedis = null;

// Create Redis client for rate limiting
const redisClient = createClient({
  url: config.redis.url,
  enable_offline_queue: false,
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  logger.error(`Redis error: ${err}`);
});

// Initialize rate limiter
const initializeRateLimiter = async () => {
  try {
    await redisClient.connect();
    
    // Create rate limiter with Redis
    rateLimiterRedis = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'rate_limit',
      points: config.rateLimit.max, // Max requests per window
      duration: config.rateLimit.windowMs / 1000, // Convert to seconds
      blockDuration: 60 * 5, // Block for 5 minutes if limit exceeded
    });
    
    logger.info('Redis rate limiter initialized');
  } catch (error) {
    logger.error('Failed to initialize Redis rate limiter:', error);
    // Fallback to in-memory rate limiting if Redis fails
    rateLimiterRedis = null;
  }
};

// Middleware function to handle rate limiting
const rateLimiter = async (req, res, next) => {
  try {
    if (!rateLimiterRedis) {
      // Fallback to next middleware if rate limiter is not initialized
      return next();
    }

    // Use IP address as the rate limit key
    const ip = req.ip || req.connection.remoteAddress;
    
    // Try to consume a point
    await rateLimiterRedis.consume(ip)
      .then(() => {
        // Request allowed
        next();
      })
      .catch((rejRes) => {
        // Request blocked
        const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000) || 1;
        
        // Set rate limit headers
        res.set('Retry-After', String(retryAfter));
        res.set('X-RateLimit-Limit', String(config.rateLimit.max));
        res.set(
          'X-RateLimit-Remaining',
          String(rejRes.remainingPoints >= 0 ? rejRes.remainingPoints : 0)
        );
        res.set('X-RateLimit-Reset', new Date(Date.now() + rejRes.msBeforeNext).toISOString());
        
        // Send rate limit exceeded response
        res.status(429).json({
          status: 'error',
          message: 'Too many requests, please try again later.',
          retryAfter: `${retryAfter} seconds`,
        });
      });
  } catch (error) {
    logger.error('Rate limiter error:', error);
    // Allow the request to proceed if there's an error with rate limiting
    next();
  }
};

// Export the rate limiter and initialization function
export { rateLimiter, initializeRateLimiter };

// Initialize the rate limiter when the module is loaded
if (config.redis.enabled) {
  initializeRateLimiter().catch((error) => {
    logger.error('Failed to initialize rate limiter:', error);
  });
}
