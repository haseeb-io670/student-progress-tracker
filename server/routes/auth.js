import express from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../middleware/auth.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Mock users for now (will be replaced with MongoDB)
// Note: In production, passwords should be hashed before storing
let users = [
  { 
    id: '1', 
    name: 'Super Admin', 
    email: 'superadmin@example.com', 
    // This is a hashed version of 'password'
    password: '$2b$10$6Ybp9vdCrGJg4YJpMdG.6.JbQj6AGFxm7BZbD9hxNzU5gqTRl4Nfu', 
    role: 'super_admin' 
  },
  { 
    id: '2', 
    name: 'Teacher', 
    email: 'teacher@example.com', 
    password: '$2b$10$6Ybp9vdCrGJg4YJpMdG.6.JbQj6AGFxm7BZbD9hxNzU5gqTRl4Nfu', 
    role: 'admin' 
  },
  { 
    id: '3', 
    name: 'Parent', 
    email: 'parent@example.com', 
    password: '$2b$10$6Ybp9vdCrGJg4YJpMdG.6.JbQj6AGFxm7BZbD9hxNzU5gqTRl4Nfu', 
    role: 'user' 
  }
];

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }
    
    // Find user by email
    const user = users.find(u => u.email === email);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    // For development convenience, also allow plain text 'password'
    const isDevMatch = (password === 'password');
    
    if (!isMatch && !isDevMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Set token in cookie (for added security)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Return user info and token (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during authentication' 
    });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already in use' 
      });
    }
    
    // Validate role
    const validRoles = ['user', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role specified' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      name,
      email,
      password: hashedPassword,
      role
    };
    
    // Add to users array
    users.push(newUser);
    
    // Generate JWT token
    const token = generateToken(newUser);
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    // Return user info and token (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', verifyToken, (req, res) => {
  try {
    // Find user by ID from token
    const user = users.find(u => u.id === req.user.userId.toString());
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Return user info (excluding password)
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword
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

export default router;
