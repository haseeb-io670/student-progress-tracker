import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
  studentId: {
    type: String,
    ref: 'Student',
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  status: {
    type: String,
    enum: ['not_studied', 'started', 'difficult', 'ok', 'confident'],
    default: 'not_studied'
  },
  notes: {
    type: String,
    trim: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness of student-topic combination
ProgressSchema.index({ studentId: 1, topicId: 1 }, { unique: true });

const Progress = mongoose.model('Progress', ProgressSchema);

export default Progress;
