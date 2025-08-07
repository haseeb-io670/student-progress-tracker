import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id || user.id, 
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Verify JWT token middleware
export const verifyToken = (req, res, next) => {
  try {
    // Get token from different sources
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
    
    // If no token found
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication failed: No token provided' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
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
    // Continue without authentication if token is invalid
    next();
  }
};
