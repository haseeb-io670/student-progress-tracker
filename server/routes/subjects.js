import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import Subject from '../models/Subject.js';
import Unit from '../models/Unit.js';
import Topic from '../models/Topic.js';

const router = express.Router();

// Validation middleware
const validateSubject = (req, res, next) => {
  const { name } = req.body;
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Subject name is required' 
    });
  }
  next();
};

const validateUnit = (req, res, next) => {
  const { name } = req.body;
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Unit name is required' 
    });
  }
  next();
};

const validateTopic = (req, res, next) => {
  const { name } = req.body;
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Topic name is required' 
    });
  }
  next();
};


// Get all subjects with their units and topics
router.get('/', verifyToken, async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate({
        path: 'units',
        populate: {
          path: 'topics'
        }
      });
    
    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects'
    });
  }
});

// Get subject by ID with units and topics
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate({
        path: 'units',
        populate: {
          path: 'topics'
        }
      });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subject'
    });
  }
});

// Create subject (admin only)
router.post('/', verifyToken, isAdmin, validateSubject, async (req, res) => {
  try {
    const { name } = req.body;
    
    const subject = await Subject.create({
      name,
      units: []
    });
    
    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subject'
    });
  }
});

// Update subject (admin only)
router.put('/:id', verifyToken, isAdmin, validateSubject, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const subject = await Subject.findByIdAndUpdate(
      id,
      { 
        name,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'units',
      populate: {
        path: 'topics'
      }
    });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subject'
    });
  }
});

// Delete subject (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Delete all topics in all units of this subject
    for (const unitId of subject.units) {
      const unit = await Unit.findById(unitId);
      if (unit) {
        await Topic.deleteMany({ _id: { $in: unit.topics } });
      }
    }
    
    // Delete all units of this subject
    await Unit.deleteMany({ subjectId: subject._id });
    
    // Delete the subject
    await Subject.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Subject and all related units and topics deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting subject'
    });
  }
});

// Add unit to subject (admin only)
router.post('/:id/units', verifyToken, isAdmin, validateUnit, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Find the subject
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    // Create the unit
    const unit = await Unit.create({
      name,
      subjectId: subject._id,
      topics: []
    });
    
    // Add unit to subject's units array
    subject.units.push(unit._id);
    await subject.save();
    
    res.status(201).json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating unit'
    });
  }
});

// Add topic to unit (admin only)
router.post('/:subjectId/units/:unitId/topics', verifyToken, isAdmin, validateTopic, async (req, res) => {
  try {
    const { subjectId, unitId } = req.params;
    const { name } = req.body;
    
    // Find the unit
    const unit = await Unit.findById(unitId);
    if (!unit || unit.subjectId.toString() !== subjectId) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    // Create the topic
    const topic = await Topic.create({
      name,
      unitId: unit._id
    });
    
    // Add topic to unit's topics array
    unit.topics.push(topic._id);
    await unit.save();
    
    res.status(201).json({
      success: true,
      data: topic
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating topic'
    });
  }
});

export default router;
