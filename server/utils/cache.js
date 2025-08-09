import { createClient } from 'redis';
import config from '../config/config.js';
import { logger } from './logger.js';

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initialize();
  }

  async initialize() {
    if (config.features.enableCaching) {
      try {
        this.client = createClient({
          url: config.redis.url || 'redis://localhost:6379'
        });

        this.client.on('error', (err) => {
          logger.error('Redis Client Error:', err);
          this.isConnected = false;
        });

        this.client.on('connect', () => {
          logger.info('Redis client connected');
          this.isConnected = true;
        });

        await this.client.connect();
      } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        this.isConnected = false;
      }
    }
  }

  /**
   * Get cached data by key
   * @param {string} key - Cache key
   * @returns {Promise<*>} - Cached data or null if not found
   */
  async get(key) {
    if (!this.isConnected) return null;
    
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {*} value - Data to cache
   * @param {number} ttl - Time to live in seconds (default: 1 hour)
   * @returns {Promise<boolean>} - True if successful
   */
  async set(key, value, ttl = 3600) {
    if (!this.isConnected) return false;
    
    try {
      await this.client.set(key, JSON.stringify(value), {
        EX: ttl,
        NX: true
      });
      return true;
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key to delete
   * @returns {Promise<boolean>} - True if successful
   */
  async del(key) {
    if (!this.isConnected) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all keys matching a pattern
   * @param {string} pattern - Pattern to match keys
   * @returns {Promise<boolean>} - True if successful
   */
  async clearPattern(pattern) {
    if (!this.isConnected) return false;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error(`Error clearing cache pattern ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache (use with caution in production)
   * @returns {Promise<boolean>} - True if successful
   */
  async flushAll() {
    if (!this.isConnected) return false;
    
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.error('Error flushing cache:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const cache = new CacheService();

/**
 * Cache middleware for Express routes
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} - Express middleware function
 */
export const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET' || !cache.isConnected) {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    
    try {
      // Try to get cached data
      const cachedData = await cache.get(key);
      
      if (cachedData !== null) {
        logger.debug(`Cache hit for ${key}`);
        return res.json(cachedData);
      }

      // If no cache hit, override res.json to cache the response
      const originalJson = res.json;
      res.json = (body) => {
        // Cache the response
        if (res.statusCode === 200) {
          cache.set(key, body, ttl).catch(err => {
            logger.error('Error setting cache:', err);
          });
        }
        originalJson.call(res, body);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

export default cache;
