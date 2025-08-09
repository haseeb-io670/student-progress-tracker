import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import path from 'path';
import config from './config/config.js';

// Import routes
import userRoutes from './routes/users.js';
import studentRoutes from './routes/students.js';
import subjectRoutes from './routes/subjects.js';
import progressRoutes from './routes/progress.js';
import authRoutes from './routes/auth.js';

// Initialize app
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors(config.cors));
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
import connectDB from './config/db.js';

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;