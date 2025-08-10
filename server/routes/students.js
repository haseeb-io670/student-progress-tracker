import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { Student, User } from '../models/index.js';

const router = express.Router();

// Get all students
router.get('/', verifyToken, async (req, res) => {
  try {
    const { role, _id } = req.user;
    
    // Filter students based on user role
    let query = {};
    
    // If user is a parent, only show their children
    if (role === 'user') {
      const user = await User.findById(_id);
      if (user && user.children && user.children.length > 0) {
        query = { _id: { $in: user.children } };
      } else {
        return res.json([]);
      }
    }
    
    const students = await Student.find(query);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Get student by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id } = req.user;
    
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if user has access to this student
    if (role === 'user') {
      const user = await User.findById(_id);
      if (!user || !user.children || !user.children.includes(student._id.toString())) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Error fetching student' });
  }
});

// Create student (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, grade, parentId } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    // Generate a unique ID based on name (lowercase, no spaces)
    const id = name.toLowerCase().replace(/\s+/g, '');
    
    // Check if student with this ID already exists
    const existingStudent = await Student.findOne({ id });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this name already exists' });
    }
    
    const newStudent = await Student.create({
      id,
      name,
      grade: grade || ''
    });
    
    // If parentId is provided, add student to parent's children array
    if (parentId) {
      await User.findByIdAndUpdate(parentId, {
        $push: { children: id }
      });
    }
    
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Error creating student' });
  }
});

// Update student (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade, parentId } = req.body;
    
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Update student fields
    if (name) student.name = name;
    if (grade) student.grade = grade;
    
    await student.save();
    
    // If parentId is provided, update parent's children array
    if (parentId) {
      // First remove student from any existing parent's children array
      await User.updateMany(
        { children: id },
        { $pull: { children: id } }
      );
      
      // Then add to new parent
      await User.findByIdAndUpdate(parentId, {
        $addToSet: { children: id }
      });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Error updating student' });
  }
});

// Delete student (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Remove student from any parent's children array
    await User.updateMany(
      { children: id },
      { $pull: { children: id } }
    );
    
    // Delete the student
    await Student.deleteOne({ id });
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Error deleting student' });
  }
});

export default router;
