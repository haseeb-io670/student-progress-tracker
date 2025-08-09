import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a student name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  grade: {
    type: String,
    trim: true
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  parents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

const Student = mongoose.model('Student', StudentSchema);

export default Student;
