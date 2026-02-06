import mongoose, { Document, Schema } from 'mongoose';

// Interface cho Comment (Sub-document)
export interface IComment {
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt?: Date;
  likes?: mongoose.Types.ObjectId[];
  parentId?: mongoose.Types.ObjectId; // For nested replies
  _id: mongoose.Types.ObjectId;
}

// Interface cho Post
export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  likes: mongoose.Types.ObjectId[];
  comments: IComment[];
  status: 'pending' | 'approved' | 'rejected';
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
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

const postSchema = new Schema<IPost>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Tối ưu khi lấy bài viết của 1 user cụ thể
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  rejectedReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Performance indexes
postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ likes: 1 });

export default mongoose.model<IPost>('Post', postSchema);