import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a topic name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
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

// Compound index to ensure uniqueness of id within a unit
TopicSchema.index({ id: 1, unitId: 1 }, { unique: true });

const Topic = mongoose.model('Topic', TopicSchema);

export default Topic;
