import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IInterview extends Document {
  user: mongoose.Types.ObjectId;
  persona: 'friendly-hr' | 'strict-manager' | 'english-native';
  chatHistory: IMessage[];
  feedback?: {
    confidenceScore?: number;
    contentScore?: number;
    suggestions?: string;
  };
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

const interviewSchema = new Schema<IInterview>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  persona: { 
    type: String, 
    enum: ['friendly-hr', 'strict-manager', 'english-native'], 
    required: true 
  },
  chatHistory: [messageSchema],
  feedback: {
    confidenceScore: Number,
    contentScore: Number,
    suggestions: String,
  },
  status: { 
    type: String, 
    enum: ['active', 'completed'], 
    default: 'active' 
  },
}, { timestamps: true });

export default mongoose.model<IInterview>('Interview', interviewSchema);