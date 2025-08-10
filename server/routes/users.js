import express from 'express';
import { verifyToken, isAdmin, isSuperAdmin } from '../middleware/auth.js';
import { User, Student } from '../models/index.js';

const router = express.Router();

// Get all users (super_admin only)
router.get('/', verifyToken, isSuperAdmin, async (req, res) => {
  try {
    // Return users without sensitive info
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get current user's information
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Get current user's children (for parents)
router.get('/me/children', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user is not a parent or has no children
    if (user.role !== 'user' || !user.children || user.children.length === 0) {
      return res.json([]);
    }
    
    // Get all children details
    const children = await Student.find({ _id: { $in: user.children } });
    res.json(children);
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ message: 'Error fetching children' });
  }
});

// Get user by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { _id, role } = req.user;
    
    // Check if user is requesting their own data or is an admin
    if (id !== _id.toString() && role !== 'super_admin' && role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Create user (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role = 'user', children = [] } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Validate role
    const validRoles = ['super_admin', 'admin', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      children
    });
    
    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Update user
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { _id, role } = req.user;
    
    // Check if user is updating their own data or is a super_admin
    if (id !== _id.toString() && role !== 'super_admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    const { name, email, role: newRole, children } = req.body;
    
    // Only super_admin can change roles
    if (newRole && newRole !== user.role && role !== 'super_admin') {
      return res.status(403).json({ message: 'Only super admins can change user roles' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (newRole && role === 'super_admin') user.role = newRole;
    if (children && Array.isArray(children)) user.children = children;
    
    await user.save();
    
    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user (super_admin only)
router.delete('/:id', verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove user
    await User.findByIdAndDelete(id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router;
