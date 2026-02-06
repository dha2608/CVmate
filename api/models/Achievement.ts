import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  user: mongoose.Types.ObjectId;
  type: 'first_cv' | 'complete_profile' | 'apply_job' | 'write_post' | 'complete_interview';
  unlockedAt: Date;
  metadata?: {
    resumeId?: string;
    jobId?: string;
    postId?: string;
    interviewId?: string;
  };
}

const achievementSchema = new Schema<IAchievement>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['first_cv', 'complete_profile', 'apply_job', 'write_post', 'complete_interview'],
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate achievements
achievementSchema.index({ user: 1, type: 1 }, { unique: true });
achievementSchema.index({ user: 1, unlockedAt: -1 });

export default mongoose.model<IAchievement>('Achievement', achievementSchema);
