import mongoose from 'mongoose';

const UnitSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a unit name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  topics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness of id within a subject
UnitSchema.index({ id: 1, subjectId: 1 }, { unique: true });

const Unit = mongoose.model('Unit', UnitSchema);

export default Unit;
