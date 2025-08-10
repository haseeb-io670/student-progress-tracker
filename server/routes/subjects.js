import express from 'express';
import mongoose from 'mongoose';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { Subject, Unit, Topic } from '../models/index.js';

const router = express.Router();

// Validation middleware
const validateSubject = (req, res, next) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Subject name is required'
    });
  }
  
  next();
};

const validateUnit = (req, res, next) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Unit name is required'
    });
  }
  
  next();
};

const validateTopic = (req, res, next) => {
  const { name } = req.body;
  
  if (!name) {
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
    const { name, id } = req.body;
    
    const subject = await Subject.create({
      id: id || `subject-${Date.now()}`, // Use provided ID or generate one
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
      id: req.body.id || `unit-${Date.now()}`, // Use provided ID or generate one
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
    
    console.log(`Adding topic to unit: ${unitId} in subject: ${subjectId}`);
    console.log('Topic data:', req.body);
    
    // Validate parameters
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      console.error('Invalid subject ID format:', subjectId);
      return res.status(400).json({
        success: false,
        message: 'Invalid subject ID format'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      console.error('Invalid unit ID format:', unitId);
      return res.status(400).json({
        success: false,
        message: 'Invalid unit ID format'
      });
    }
    
    // Find the unit
    const unit = await Unit.findById(unitId);
    if (!unit) {
      console.error('Unit not found with ID:', unitId);
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    // Verify unit belongs to subject
    if (unit.subjectId.toString() !== subjectId) {
      console.error(`Unit ${unitId} does not belong to subject ${subjectId}`);
      return res.status(400).json({
        success: false,
        message: 'Unit does not belong to the specified subject'
      });
    }
    
    // Create the topic
    const topicData = {
      name,
      unitId: unit._id
    };
    
    console.log('Creating topic with data:', topicData);
    const topic = await Topic.create(topicData);
    
    // Add topic to unit's topics array
    unit.topics.push(topic._id);
    
    // Use save with validateBeforeSave: false to avoid validation errors
    // This is needed because we're only updating the topics array, not the entire unit
    await unit.save({ validateBeforeSave: false });
    
    console.log('Topic created successfully:', topic);
    res.status(201).json({
      success: true,
      data: topic
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A topic with this name already exists in this unit'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating topic: ' + error.message
    });
  }
});

// Update unit (admin only)
router.put('/:subjectId/units/:unitId', verifyToken, isAdmin, validateUnit, async (req, res) => {
  try {
    const { subjectId, unitId } = req.params;
    const { name } = req.body;
    
    // Find the unit and verify it belongs to the subject
    const unit = await Unit.findById(unitId);
    if (!unit || unit.subjectId.toString() !== subjectId) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found or does not belong to the subject'
      });
    }
    
    // Update the unit
    unit.name = name;
    unit.updatedAt = Date.now();
    await unit.save();
    
    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating unit'
    });
  }
});

// Delete unit (admin only)
router.delete('/:subjectId/units/:unitId', verifyToken, isAdmin, async (req, res) => {
  try {
    const { subjectId, unitId } = req.params;
    
    // Find the subject
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    // Find the unit and verify it belongs to the subject
    const unit = await Unit.findById(unitId);
    if (!unit || unit.subjectId.toString() !== subjectId) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found or does not belong to the subject'
      });
    }
    
    // Delete all topics in this unit
    await Topic.deleteMany({ _id: { $in: unit.topics } });
    
    // Remove unit from subject's units array
    subject.units = subject.units.filter(id => id.toString() !== unitId);
    await subject.save();
    
    // Delete the unit
    await Unit.findByIdAndDelete(unitId);
    
    res.json({
      success: true,
      message: 'Unit and all related topics deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting unit'
    });
  }
});

// Update topic (admin only)
router.put('/:subjectId/units/:unitId/topics/:topicId', verifyToken, isAdmin, validateTopic, async (req, res) => {
  try {
    const { subjectId, unitId, topicId } = req.params;
    const { name } = req.body;
    
    // Find the unit and verify it belongs to the subject
    const unit = await Unit.findById(unitId);
    if (!unit || unit.subjectId.toString() !== subjectId) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found or does not belong to the subject'
      });
    }
    
    // Find the topic and verify it belongs to the unit
    const topic = await Topic.findById(topicId);
    if (!topic || topic.unitId.toString() !== unitId) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found or does not belong to the unit'
      });
    }
    
    // Update the topic
    topic.name = name;
    topic.updatedAt = Date.now();
    await topic.save();
    
    res.json({
      success: true,
      data: topic
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating topic'
    });
  }
});

// Delete topic (admin only)
router.delete('/:subjectId/units/:unitId/topics/:topicId', verifyToken, isAdmin, async (req, res) => {
  try {
    const { subjectId, unitId, topicId } = req.params;
    
    // Find the unit and verify it belongs to the subject
    const unit = await Unit.findById(unitId);
    if (!unit || unit.subjectId.toString() !== subjectId) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found or does not belong to the subject'
      });
    }
    
    // Find the topic and verify it belongs to the unit
    const topic = await Topic.findById(topicId);
    if (!topic || topic.unitId.toString() !== unitId) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found or does not belong to the unit'
      });
    }
    
    // Remove topic from unit's topics array
    unit.topics = unit.topics.filter(id => id.toString() !== topicId);
    await unit.save();
    
    // Delete the topic
    await Topic.findByIdAndDelete(topicId);
    
    res.json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting topic'
    });
  }
});

export default router;
