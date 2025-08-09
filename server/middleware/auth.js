import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import config from '../config/config.js';
import ApiError from '../utils/ApiError.js';

// Promisify JWT methods
const verifyJwt = promisify(jwt.verify);

/**
 * Generate access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Tokens object with access and refresh tokens
 */
export const generateTokens = async (user) => {
  try {
    // Create access token
    const accessToken = jwt.sign(
      { 
        userId: user._id || user.id, 
        email: user.email,
        role: user.role 
      },
      config.jwt.secret,
      { expiresIn: `${config.jwt.accessExpirationMinutes}m` }
    );

    // Create refresh token
    const refreshToken = jwt.sign(
      { userId: user._id || user.id },
      config.jwt.secret,
      { expiresIn: `${config.jwt.refreshExpirationDays}d` }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Error generating tokens');
  }
};

/**
 * Verify JWT token and attach user to request
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from different sources
    let token;
    
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // Then check cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      return next(new ApiError(401, 'Authentication required'));
    }
    
    // Verify token
    const decoded = await verifyJwt(token, config.jwt.secret);
    
    // Add user data to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication failed: Token expired' 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed: Invalid token' 
    });
  }
};

// Check if user is admin or super_admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied: Requires admin privileges' 
    });
  }
  next();
};

// Check if user is super_admin
export const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied: Requires super admin privileges' 
    });
  }
  next();
};

// Optional token verification (doesn't block if no token)
export const optionalAuth = (req, res, next) => {
  try {
    let token;
    
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // Check cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // If no token found, continue without authentication
    if (!token) {
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user data to request
    req.user = decoded;
    next();
  } catch (error) {
    next();
  }
};
