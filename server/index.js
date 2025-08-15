import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// Import routes
import userRoutes from './routes/users.js';
import studentRoutes from './routes/students.js';
import subjectRoutes from './routes/subjects.js';
import progressRoutes from './routes/progress.js';
import authRoutes from './routes/auth.js';

// Initialize app
const app = express();


// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(helmet()); // Set secure HTTP headers

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/progress', progressRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    'success': true,
    'message': 'Student Progress Tracker API is running',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Serve frontend in production
// if (process.env.NODE_ENV === 'production') {
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/dist/index.html'));
//   });
// }

// Load environment variables
dotenv.config();

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    
    // Drop the old index that's causing the duplicate key error
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const topicsCollection = collections.find(c => c.name === 'topics');
      
      if (topicsCollection) {
        const indexes = await mongoose.connection.db.collection('topics').indexes();
        const oldIndex = indexes.find(idx => idx.name === 'id_1_unitId_1');
        
        if (oldIndex) {
          console.log('Dropping old index: id_1_unitId_1');
          await mongoose.connection.db.collection('topics').dropIndex('id_1_unitId_1');
          console.log('Old index dropped successfully');
        } else {
          console.log('Old index id_1_unitId_1 not found');
        }
      }
    } catch (indexError) {
      console.error('Error handling indexes:', indexError);
      // Continue server startup even if index drop fails
    }
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

startServer();




export default app;
