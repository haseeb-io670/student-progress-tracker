import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Mock progress data (will be replaced with MongoDB)
let progress = [
  {
    id: '1',
    studentId: '1',
    subjectId: '1',
    unitId: '1',
    topicId: '1',
    status: 'started',
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    studentId: '1',
    subjectId: '1',
    unitId: '1',
    topicId: '2',
    status: 'ok',
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    studentId: '1',
    subjectId: '1',
    unitId: '1',
    topicId: '3',
    status: 'confident',
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    studentId: '1',
    subjectId: '2',
    unitId: '1',
    topicId: '1',
    status: 'started',
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    studentId: '1',
    subjectId: '3',
    unitId: '1',
    topicId: '1',
    status: 'started',
    updatedAt: new Date().toISOString()
  }
];

// Get progress for a student
router.get('/student/:studentId', verifyToken, (req, res) => {
  const { studentId } = req.params;
  const { role, userId } = req.user;
  
  // Check if user has access to this student's progress
  if (role === 'user') {
    // Mock check if student belongs to this parent
    const studentBelongsToParent = ['1', '2'].includes(studentId) && userId === '4' || 
                                   ['3'].includes(studentId) && userId === '5';
    
    if (!studentBelongsToParent) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }
  
  const studentProgress = progress.filter(p => p.studentId === studentId);
  
  res.json(studentProgress);
});

// Get progress for a student in a specific subject
router.get('/student/:studentId/subject/:subjectId', verifyToken, (req, res) => {
  const { studentId, subjectId } = req.params;
  const { role, userId } = req.user;
  
  // Check if user has access to this student's progress
  if (role === 'user') {
    // Mock check if student belongs to this parent
    const studentBelongsToParent = ['1', '2'].includes(studentId) && userId === '4' || 
                                   ['3'].includes(studentId) && userId === '5';
    
    if (!studentBelongsToParent) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }
  
  const subjectProgress = progress.filter(
    p => p.studentId === studentId && p.subjectId === subjectId
  );
  
  res.json(subjectProgress);
});

// Update progress for a topic (admin only)
router.post('/', verifyToken, isAdmin, (req, res) => {
  const { studentId, subjectId, unitId, topicId, status } = req.body;
  
  if (!studentId || !subjectId || !unitId || !topicId || !status) {
    return res.status(400).json({ 
      message: 'StudentId, subjectId, unitId, topicId, and status are required' 
    });
  }
  
  // Check if valid status
  const validStatuses = ['started', 'difficult', 'ok', 'confident', 'not_studied'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      message: 'Status must be one of: started, difficult, ok, confident, not_studied' 
    });
  }
  
  // Check if progress already exists
  const progressIndex = progress.findIndex(
    p => p.studentId === studentId && 
         p.subjectId === subjectId && 
         p.unitId === unitId && 
         p.topicId === topicId
  );
  
  if (progressIndex !== -1) {
    // Update existing progress
    progress[progressIndex] = {
      ...progress[progressIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    
    return res.json(progress[progressIndex]);
  }
  
  // Create new progress
  const newProgress = {
    id: (progress.length + 1).toString(),
    studentId,
    subjectId,
    unitId,
    topicId,
    status,
    updatedAt: new Date().toISOString()
  };
  
  progress.push(newProgress);
  
  res.status(201).json(newProgress);
});

export default router;
