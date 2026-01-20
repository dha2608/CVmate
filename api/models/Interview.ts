import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'system', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  persona: { type: String, enum: ['friendly-hr', 'strict-manager', 'english-native'], required: true },
  chatHistory: [messageSchema],
  feedback: {
    confidenceScore: Number,
    contentScore: Number,
    suggestions: String,
  },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
}, { timestamps: true });

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
