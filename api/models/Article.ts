import mongoose, { Document, Schema } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  content: string;
  category: 'Tips CV' | 'Interview Hack' | 'Market News';
  summary?: string;
  author: mongoose.Types.ObjectId;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<IArticle>({
  title: {
    type: String,
    required: true,
    trim: true
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
    type: String,
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String
  }
}, {
  timestamps: true
});

articleSchema.index({ title: 'text', content: 'text' });
articleSchema.index({ category: 1 });

export default mongoose.model<IArticle>('Article', articleSchema);