import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  // id: {
  //   type: String,
  //   required: true,
  //   trim: true
  // },
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

// Compound index to ensure uniqueness of name within a unit
TopicSchema.index({ name: 1, unitId: 1 }, { unique: true });

// Drop the old index if it exists
TopicSchema.on('index', function(err) {
  if (err) {
    console.error('Topic index error: ' + err);
  } else {
    console.log('Topic indexing completed');
  }
});

const Topic = mongoose.model('Topic', TopicSchema);

export default Topic;
