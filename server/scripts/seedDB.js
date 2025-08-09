import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User, Student, Subject, Unit, Topic } from '../models/index.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Subject.deleteMany({});
    await Unit.deleteMany({});
    await Topic.deleteMany({});
    
    console.log('Previous data cleared');

    // Create users
    const hashedPassword = await bcrypt.hash('password', 10);
    
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: 'super_admin'
    });

    const teacher = await User.create({
      name: 'Teacher',
      email: 'teacher@example.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Create students
    const aahil = await Student.create({
      id: 'aahil',
      name: 'Aahil',
      grade: '10'
    });

    const sara = await Student.create({
      id: 'sara',
      name: 'Sara',
      grade: '9'
    });

    const john = await Student.create({
      id: 'john',
      name: 'John',
      grade: '11'
    });

    // Create parent users with children
    const parent1 = await User.create({
      name: 'Parent 1',
      email: 'parent@example.com',
      password: hashedPassword,
      role: 'user',
      children: ['aahil', 'sara']
    });

    const parent2 = await User.create({
      name: 'Parent 2',
      email: 'parent2@example.com',
      password: hashedPassword,
      role: 'user',
      children: ['john']
    });

    // Create subjects
    const biology = await Subject.create({
      id: 'biology',
      name: 'Biology'
    });

    const chemistry = await Subject.create({
      id: 'chemistry',
      name: 'Chemistry'
    });

    const physics = await Subject.create({
      id: 'physics',
      name: 'Physics'
    });

    // Create units for Biology
    const biologyUnit1 = await Unit.create({
      id: '1',
      name: 'Cell Biology',
      subjectId: biology._id
    });

    const biologyUnit2 = await Unit.create({
      id: '2',
      name: 'Genetics',
      subjectId: biology._id
    });

    // Create topics for Biology Unit 1
    const biologyUnit1Topics = await Topic.insertMany([
      {
        id: '1',
        name: 'Cell Structure',
        unitId: biologyUnit1._id
      },
      {
        id: '2',
        name: 'Cell Transport',
        unitId: biologyUnit1._id
      },
      {
        id: '3',
        name: 'Cell Division',
        unitId: biologyUnit1._id
      }
    ]);

    // Create topics for Biology Unit 2
    const biologyUnit2Topics = await Topic.insertMany([
      {
        id: '1',
        name: 'DNA Structure',
        unitId: biologyUnit2._id
      },
      {
        id: '2',
        name: 'Inheritance',
        unitId: biologyUnit2._id
      },
      {
        id: '3',
        name: 'Genetic Disorders',
        unitId: biologyUnit2._id
      }
    ]);

    // Update units with topics
    await Unit.findByIdAndUpdate(biologyUnit1._id, {
      topics: biologyUnit1Topics.map(topic => topic._id)
    });

    await Unit.findByIdAndUpdate(biologyUnit2._id, {
      topics: biologyUnit2Topics.map(topic => topic._id)
    });

    // Update subject with units
    await Subject.findByIdAndUpdate(biology._id, {
      units: [biologyUnit1._id, biologyUnit2._id]
    });

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
