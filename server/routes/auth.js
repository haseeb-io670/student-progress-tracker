import express from 'express';
import Joi from 'joi';
import { generateTokens, verifyToken } from '../middleware/auth.js';
import { User } from '../models/index.js';
import { validate } from '../utils/validate.js';
import ApiError from '../utils/ApiError.js';
import {
  successResponse,
  unauthorizedResponse,
  
  serverErrorResponse
} from '../utils/response.js';

const router = express.Router();

// Validation schemas
const loginSchema = {
  body: {
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().required().label('Password')
  }
};

const refreshTokenSchema = {
  body: {
    refreshToken: Joi.string().required().label('Refresh Token')
  }
};

const registerSchema = {
  body: {
    name: Joi.string().required().label('Name'),
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().min(8).required().label('Password'),
    role: Joi.string().valid('user', 'admin').default('user')
  }
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & get tokens
 * @access  Public
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');
    
    // Check if user exists
    if (!user) {
      console.log('Login failed: User not found');
      return unauthorizedResponse(res, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password check:', { isValid: isPasswordValid });
    
    if (!isPasswordValid) {
      console.log('Login failed: Invalid password');
      return unauthorizedResponse(res, 'Invalid email or password');
    }
    
    try {
      // Generate tokens
      const { accessToken, refreshToken } = await generateTokens(user);
      
      // Set access token in cookie
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      // Set refresh token in cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Remove password from output
      const userData = user.toObject();
      delete userData.password;
      
      // Send response with user data
      return res.status(200).json({
        success: true,
        data: {
          user: userData
        }
      });
    } catch (error) {
      return serverErrorResponse(res, error);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', validate(refreshTokenSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(401, 'No refresh token provided');
    }

    // Verify refresh token
    const decoded = await verifyJwt(refreshToken, config.jwt.secret);
    
    // Find user by ID from token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000 // days to ms
    });

    // Send response with new access token
    res.status(200).json({
      status: 'success',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'Email already in use');
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000 // days to ms
    });

    // Remove password from output
    user.password = undefined;

    // Send response with user data and access token
    res.status(201).json({
      status: 'success',
      data: {
        user,
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (clear refresh token cookie)
 * @access  Private
 */
/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user and clear refresh token cookie
 * @access Private
 */
router.post('/logout', verifyToken, (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return successResponse(res, null, 'Successfully logged out');
  } catch (error) {
    return serverErrorResponse(res, error);
  }
});



/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    // Find user by ID from token
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        children: user.children || []
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching user data' 
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user / clear cookie
 * @access  Public
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
});

/**
 * @route   POST /api/auth/setup
 * @desc    Create the first super admin user (only if no users exist)
 * @access  Public
 */
router.post('/setup', async (req, res) => {
  try {
    console.log('Setup endpoint called with body:', req.body);
    
    // Check if any users already exist
    const userCount = await User.countDocuments();
    console.log('Current user count:', userCount);
    
    if (userCount > 0) {
      console.log('Setup rejected: Users already exist');
      return res.status(400).json({
        success: false,
        message: 'Setup already completed. Users already exist in the system.'
      });
    }
    
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email, and password' 
      });
    }
    
    // Create the first super admin user
    const newUser = new User({
      name,
      email,
      password,
      role: 'super_admin'
    });
    
    await newUser.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(newUser);
    
    // Set access token in cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(201).json({
      success: true,
      message: 'Setup completed successfully! First super admin user created.',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          children: newUser.children || []
        }
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during setup' 
    });
  }
});

export default router;