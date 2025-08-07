import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import studentRoutes from './routes/students.js';
import subjectRoutes from './routes/subjects.js';
import progressRoutes from './routes/progress.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Set port
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/progress', progressRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Student Progress Management API is running');
});

// MongoDB connection (commented out until MongoDB is set up)
/*
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));
*/

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
