import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import dotenv from 'dotenv';
import ApiError from '../utils/ApiError.js';

// Load environment variables
dotenv.config();

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
      process.env.JWT_SECRET,
      { expiresIn: `${process.env.JWT_ACCESS_EXPIRATION_MINUTES}m` }
    );

    // Create refresh token
    const refreshToken = jwt.sign(
      { userId: user._id || user.id },
      process.env.JWT_SECRET,
      { expiresIn: `${parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS)}d` }
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
    
    // Check cookies first
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    // Fallback to Authorization header
    else {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
    if (!token) {
      return next(new ApiError(401, 'Authentication required'));
    }
    
    // Verify token
    const decoded = await verifyJwt(token, process.env.JWT_SECRET);
    
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request
    req.user = decoded;
    next();
  } catch (error) {
    next();
  }
};
