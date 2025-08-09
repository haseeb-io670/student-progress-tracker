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
app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend
  credentials: true // Allow cookies
}));
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

// Import database connection
  const conn = await mongoose.connect('mongodb+srv://haseebsajjadio670:KdF.emgr9f-24Ec@cluster0.rvhaavj.mongodb.net/') .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(5000, () => {
      console.log(`Server running on port ${5000}`);
    });
  });
// Connect to MongoDB and start server
 



export default app;