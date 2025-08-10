import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { Progress, User, Student, Topic, Subject, Unit } from '../models/index.js';

const router = express.Router();

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'confident': return 'bg-green-100 text-green-800';
    case 'ok': return 'bg-blue-100 text-blue-800';
    case 'started': return 'bg-yellow-100 text-yellow-800';
    case 'difficult': return 'bg-red-100 text-red-800';
    case 'not_studied': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to format time
const formatTime = (date) => {
  const now = new Date();
  const updateDate = new Date(date);
  const diffMs = now - updateDate;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return updateDate.toLocaleDateString();
};

// Get recent progress updates
router.get('/recent', verifyToken, async (req, res) => {
  try {
    const { role, _id } = req.user;
    
    let query = {};
    
    // If user is a parent, only show progress for their children
    if (role === 'user') {
      const user = await User.findById(_id);
      if (!user || !user.children || user.children.length === 0) {
        return res.json([]);
      }
      query.studentId = { $in: user.children };
    }
    
    // Get the 10 most recent progress updates
    const recentProgress = await Progress.find(query)
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate({
        path: 'topicId',
        populate: {
          path: 'unitId',
          populate: {
            path: 'subjectId'
          }
        }
      })
      .populate('studentId')
      .populate('updatedBy');
    
    // Format the response
    const formattedProgress = recentProgress.map(progress => {
      const topic = progress.topicId;
      const unit = topic?.unitId;
      const subject = unit?.subjectId;
      const student = progress.studentId;
      const updatedBy = progress.updatedBy;
      
      return {
        id: progress._id,
        title: 'Student progress updated',
        description: `${student?.name} - ${subject?.name} - ${topic?.name}`,
        status: progress.status.charAt(0).toUpperCase() + progress.status.slice(1),
        statusColor: getStatusColor(progress.status),
        time: formatTime(progress.updatedAt),
        icon: null // Will be added on the client side
      };
    });
    
    res.json(formattedProgress);
  } catch (error) {
    console.error('Error fetching recent progress:', error);
    res.status(500).json({ message: 'Error fetching recent progress' });
  }
});

// Get progress for a student
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { role, _id } = req.user;
    
    // Check if user has access to this student's progress
    if (role === 'user') {
      // Check if student belongs to this parent
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Check if this parent is associated with the student
      if (!student.parents.includes(_id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    
    // Get all progress entries for this student
    const studentProgress = await Progress.find({ studentId })
      .populate('topicId')
      .populate({
        path: 'topicId',
        populate: { path: 'unitId' }
      });
    
    res.json(studentProgress);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ message: 'Error fetching student progress' });
  }
});

// Get progress for a student in a specific subject
router.get('/student/:studentId/subject/:subjectId', verifyToken, async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;
    const { role, _id } = req.user;
    
    // Check if user has access to this student's progress
    if (role === 'user') {
      // Check if student belongs to this parent
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Check if this parent is associated with the student
      if (!student.parents.includes(_id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    
    // Get all topics for this subject
    const subject = await Subject.findById(subjectId).populate({
      path: 'units',
      populate: { path: 'topics' }
    });
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Get all topic IDs for this subject
    const topicIds = [];
    subject.units.forEach(unit => {
      unit.topics.forEach(topic => {
        topicIds.push(topic._id);
      });
    });
    
    // Get progress entries for these topics and this student
    const progressEntries = await Progress.find({
      studentId,
      topicId: { $in: topicIds }
    }).populate('topicId');
    
    res.json(progressEntries);
  } catch (error) {
    console.error('Error fetching student subject progress:', error);
    res.status(500).json({ message: 'Error fetching student subject progress' });
  }
});

// Update progress for a topic (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { studentId, topicId, status, notes } = req.body;
    
    if (!studentId || !topicId || !status) {
      return res.status(400).json({ message: 'StudentId, topicId, and status are required' });
    }
    
    // Validate status
    const validStatuses = ['not_studied', 'started', 'difficult', 'ok', 'confident'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if topic exists
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Find or create progress entry
    let progressEntry = await Progress.findOne({ studentId, topicId });
    
    if (progressEntry) {
      // Update existing entry
      progressEntry.status = status;
      if (notes !== undefined) progressEntry.notes = notes;
      progressEntry.updatedBy = req.user._id;
      progressEntry.updatedAt = new Date();
      
      await progressEntry.save();
    } else {
      // Create new entry
      progressEntry = await Progress.create({
        studentId,
        topicId,
        status,
        notes: notes || '',
        updatedBy: req.user._id
      });
    }
    
    res.status(201).json(progressEntry);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Error updating progress' });
  }
});

export default router;
