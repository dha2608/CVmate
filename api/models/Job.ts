import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String, // Full-time, Part-time, Remote, Contract
    required: true
  },
  salary: {
    type: String, // e.g., "$100k - $120k"
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String
  }],
  logo: {
    type: String // URL to company logo
  },
  postedAt: {
    type: Date,
    default: Date.now
  },
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

export default mongoose.model('Job', jobSchema);
