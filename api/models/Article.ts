import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Tips CV', 'Interview Hack', 'Market News'],
    default: 'Tips CV'
  },
  summary: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  image: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Article', articleSchema);
