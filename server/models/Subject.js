import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a subject name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  units: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
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

const Subject = mongoose.model('Subject', SubjectSchema);

export default Subject;
