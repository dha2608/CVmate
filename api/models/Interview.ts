import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IPerQuestionFeedback {
  question: string;
  answer: string;
  score: number;
  feedback: string;
}

export interface IInterviewFeedback {
  confidenceScore?: number;
  contentScore?: number;
  suggestions?: string;
  strengths?: string[];
  improvements?: string[];
  overallScore?: number;
  scoresByDimension?: {
    communication?: number;
    content?: number;
    confidence?: number;
    structure?: number;
  };
  perQuestionFeedback?: IPerQuestionFeedback[];
}

export interface IInterview extends Document {
  user: mongoose.Types.ObjectId;
  persona: 'friendly-hr' | 'strict-manager' | 'english-native';
  chatHistory: IMessage[];
  feedback?: IInterviewFeedback;
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  role: { 
    type: String, 
    enum: ['user', 'system', 'assistant'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: {
    type: Date, 
    default: Date.now 
  },
}, { _id: false });

const perQuestionFeedbackSchema = new Schema<IPerQuestionFeedback>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  score: { type: Number, min: 0, max: 100, required: true },
  feedback: { type: String, required: true },
}, { _id: false });

const interviewSchema = new Schema<IInterview>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  persona: { 
    type: String, 
    enum: ['friendly-hr', 'strict-manager', 'english-native', 'tech-lead', 'startup-founder', 'executive', 'academic'], 
    required: true 
  },
  chatHistory: [messageSchema],
  feedback: {
    confidenceScore: Number,
    contentScore: Number,
    suggestions: String,
    strengths: [String],
    improvements: [String],
    overallScore: Number,
    scoresByDimension: {
      communication: Number,
      content: Number,
      confidence: Number,
      structure: Number,
    },
    perQuestionFeedback: [perQuestionFeedbackSchema],
  },
  status: { 
    type: String, 
    enum: ['active', 'completed'], 
    default: 'active' 
  },
}, { timestamps: true });

// Performance indexes
interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ status: 1, createdAt: -1 });
interviewSchema.index({ persona: 1 });

export default mongoose.model<IInterview>('Interview', interviewSchema);