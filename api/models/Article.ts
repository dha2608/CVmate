import mongoose, { Document, Schema } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  content: string;
  category: 'Tips CV' | 'Interview Hack' | 'Market News';
  summary?: string;
  author: mongoose.Types.ObjectId;
  image?: string;
  coverImage?: string;
  slug?: string;
  tags?: string[];
  isPublished?: boolean;
  views?: number;
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
  },
  coverImage: {
    type: String
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  tags: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Text search index
articleSchema.index({ title: 'text', content: 'text' });
// Performance indexes
articleSchema.index({ category: 1 });
articleSchema.index({ author: 1, createdAt: -1 });
articleSchema.index({ isPublished: 1, createdAt: -1 });
articleSchema.index({ slug: 1 }, { unique: true, sparse: true });

export default mongoose.model<IArticle>('Article', articleSchema);