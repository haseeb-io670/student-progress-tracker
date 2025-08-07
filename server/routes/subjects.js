import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Mock subjects data (will be replaced with MongoDB)
let subjects = [
  { 
    id: '1', 
    name: 'Biology',
    units: [
      { 
        id: '1', 
        name: 'Cell biology',
        topics: [
          { id: '1', name: 'Cell structure' },
          { id: '2', name: 'Eukaryotes and prokaryotes' },
          { id: '3', name: 'Animal and plant cells' },
          { id: '4', name: 'Cell specialisation' },
          { id: '5', name: 'Cell differentiation' },
          { id: '6', name: 'Microscopy' }
        ]
      },
      { 
        id: '2', 
        name: 'Organisation',
        topics: [
          { id: '1', name: 'Principles of organisation' },
          { id: '2', name: 'Animal tissues, organs and organ systems' }
        ]
      }
    ]
  },
  { 
    id: '2', 
    name: 'Chemistry',
    units: [
      { 
        id: '1', 
        name: 'Atomic structure and the periodic table',
        topics: [
          { id: '1', name: 'A simple model of the atom, symbols, relative atomic mass, electronic charge and isotopes' },
          { id: '2', name: 'Atoms, elements and compounds' },
          { id: '3', name: 'Mixtures' }
        ]
      },
      { 
        id: '2', 
        name: 'Bonding, structure, and the properties of matter',
        topics: [
          { id: '1', name: 'Chemical bonds, ionic, covalent and metallic' }
        ]
      }
    ]
  },
  { 
    id: '3', 
    name: 'Physics',
    units: [
      { 
        id: '1', 
        name: 'Energy',
        topics: [
          { id: '1', name: 'Energy changes in a system, and the ways energy is stored before and after such changes' },
          { id: '2', name: 'Energy stores and systems' },
          { id: '3', name: 'Changes in energy' }
        ]
      },
      { 
        id: '2', 
        name: 'Electricity',
        topics: [
          { id: '1', name: 'Current, potential difference and resistance' },
          { id: '2', name: 'Standard circuit diagram symbols' }
        ]
      }
    ]
  }
];

// Get all subjects
router.get('/', verifyToken, (req, res) => {
  res.json(subjects);
});

// Get subject by ID
router.get('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  
  const subject = subjects.find(s => s.id === id);
  
  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  
  res.json(subject);
});

// Create subject (admin only)
router.post('/', verifyToken, isAdmin, (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  const newSubject = {
    id: (subjects.length + 1).toString(),
    name,
    units: []
  };
  
  subjects.push(newSubject);
  
  res.status(201).json(newSubject);
});

// Update subject (admin only)
router.put('/:id', verifyToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  const subjectIndex = subjects.findIndex(s => s.id === id);
  
  if (subjectIndex === -1) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  
  subjects[subjectIndex] = {
    ...subjects[subjectIndex],
    name: name || subjects[subjectIndex].name
  };
  
  res.json(subjects[subjectIndex]);
});

// Delete subject (admin only)
router.delete('/:id', verifyToken, isAdmin, (req, res) => {
  const { id } = req.params;
  
  const subjectIndex = subjects.findIndex(s => s.id === id);
  
  if (subjectIndex === -1) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  
  subjects = subjects.filter(s => s.id !== id);
  
  res.json({ message: 'Subject deleted successfully' });
});

// Add unit to subject (admin only)
router.post('/:id/units', verifyToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  const subjectIndex = subjects.findIndex(s => s.id === id);
  
  if (subjectIndex === -1) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  
  const newUnit = {
    id: (subjects[subjectIndex].units.length + 1).toString(),
    name,
    topics: []
  };
  
  subjects[subjectIndex].units.push(newUnit);
  
  res.status(201).json(newUnit);
});

// Add topic to unit (admin only)
router.post('/:subjectId/units/:unitId/topics', verifyToken, isAdmin, (req, res) => {
  const { subjectId, unitId } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  const subject = subjects.find(s => s.id === subjectId);
  
  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  
  const unit = subject.units.find(u => u.id === unitId);
  
  if (!unit) {
    return res.status(404).json({ message: 'Unit not found' });
  }
  
  const newTopic = {
    id: (unit.topics.length + 1).toString(),
    name
  };
  
  unit.topics.push(newTopic);
  
  res.status(201).json(newTopic);
});

export default router;
