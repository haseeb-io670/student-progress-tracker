import express from 'express';
import { verifyToken, isAdmin, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Mock users (will be replaced with MongoDB)
let users = [
  { id: '1', name: 'Super Admin', email: 'superadmin@example.com', role: 'super_admin' },
  { id: '2', name: 'Teacher 1', email: 'teacher1@example.com', role: 'admin' },
  { id: '3', name: 'Teacher 2', email: 'teacher2@example.com', role: 'admin' },
  { id: '4', name: 'Parent 1', email: 'parent1@example.com', role: 'user' },
  { id: '5', name: 'Parent 2', email: 'parent2@example.com', role: 'user' }
];

// Get all users (super_admin only)
router.get('/', verifyToken, isSuperAdmin, (req, res) => {
  // Return users without sensitive info
  const safeUsers = users.map(({ password, ...user }) => user);
  res.json(safeUsers);
});

// Get user by ID
router.get('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.user;
  
  // Check if user is requesting their own data or is an admin
  if (userId !== id && role !== 'super_admin' && role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Return user without password
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Create user (admin only)
router.post('/', verifyToken, isAdmin, (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already in use' });
  }
  
  // Create new user
  const newUser = {
    id: (users.length + 1).toString(),
    name,
    email,
    password,
    role
  };
  
  // Add to users array
  users.push(newUser);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

// Update user
router.put('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.user;
  
  // Check if user is updating their own data or is an admin
  if (userId !== id && role !== 'super_admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Update user
  const { name, email, role: newRole } = req.body;
  
  // Only super_admin can change roles
  if (newRole && newRole !== users[userIndex].role && role !== 'super_admin') {
    return res.status(403).json({ message: 'Only super admins can change user roles' });
  }
  
  users[userIndex] = {
    ...users[userIndex],
    name: name || users[userIndex].name,
    email: email || users[userIndex].email,
    role: newRole || users[userIndex].role
  };
  
  // Return updated user without password
  const { password, ...userWithoutPassword } = users[userIndex];
  res.json(userWithoutPassword);
});

// Delete user (super_admin only)
router.delete('/:id', verifyToken, isSuperAdmin, (req, res) => {
  const { id } = req.params;
  
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Remove user
  users = users.filter(u => u.id !== id);
  
  res.json({ message: 'User deleted successfully' });
});

export default router;
