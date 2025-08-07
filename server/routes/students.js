import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Mock students data (will be replaced with MongoDB)
let students = [
  { id: '1', name: 'Aahil', parentId: '4' },
  { id: '2', name: 'Sara', parentId: '4' },
  { id: '3', name: 'John', parentId: '5' }
];

// Get all students
router.get('/', verifyToken, (req, res) => {
  const { role, userId } = req.user;
  
  // Filter students based on user role
  let filteredStudents = students;
  
  // If user is a parent, only show their children
  if (role === 'user') {
    filteredStudents = students.filter(student => student.parentId === userId);
  }
  
  res.json(filteredStudents);
});

// Get student by ID
router.get('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { role, userId } = req.user;
  
  const student = students.find(s => s.id === id);
  
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  // Check if user has access to this student
  if (role === 'user' && student.parentId !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  res.json(student);
});

// Create student (admin only)
router.post('/', verifyToken, isAdmin, (req, res) => {
  const { name, parentId } = req.body;
  
  if (!name || !parentId) {
    return res.status(400).json({ message: 'Name and parentId are required' });
  }
  
  const newStudent = {
    id: (students.length + 1).toString(),
    name,
    parentId
  };
  
  students.push(newStudent);
  
  res.status(201).json(newStudent);
});

// Update student (admin only)
router.put('/:id', verifyToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { name, parentId } = req.body;
  
  const studentIndex = students.findIndex(s => s.id === id);
  
  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  students[studentIndex] = {
    ...students[studentIndex],
    name: name || students[studentIndex].name,
    parentId: parentId || students[studentIndex].parentId
  };
  
  res.json(students[studentIndex]);
});

// Delete student (admin only)
router.delete('/:id', verifyToken, isAdmin, (req, res) => {
  const { id } = req.params;
  
  const studentIndex = students.findIndex(s => s.id === id);
  
  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  students = students.filter(s => s.id !== id);
  
  res.json({ message: 'Student deleted successfully' });
});

export default router;
