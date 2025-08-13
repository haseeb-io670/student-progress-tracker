import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { Student, User } from '../models/index.js';

const router = express.Router();

// Get all students
router.get('/', verifyToken, async (req, res) => {
  try {
    // No filtering based on user role - all authenticated users can see all students
    const students = await Student.find({});
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
    
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
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
    const { name, grade, parentId, subjects } = req.body;
    
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
      grade: grade || '',
      subjects: subjects || []
    });
    
    // If parentId is provided, add student to parent's children array
    if (parentId) {
      await User.findByIdAndUpdate(parentId, {
        $push: { children: newStudent._id }
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
    const { name, grade, parentId, subjects } = req.body;
    
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Update student fields
    if (name) student.name = name;
    if (grade) student.grade = grade;
    if (subjects) student.subjects = subjects;
    
    await student.save();
    
    // If parentId is provided, update parent's children array
    if (parentId) {
      // First remove student from any existing parent's children array
      await User.updateMany(
        { children: student._id },
        { $pull: { children: student._id } }
      );
      
      // Then add to new parent
      await User.findByIdAndUpdate(parentId, {
        $addToSet: { children: student._id }
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
      { children: student._id },
      { $pull: { children: student._id } }
    );
    
    // Delete the student
    await Student.deleteOne({ _id: id });
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Error deleting student' });
  }
});

export default router;
