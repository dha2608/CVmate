import mongoose, { Document, Schema } from 'mongoose';
import type { IResume } from './Resume.js';

export interface IResumeHistory extends Document {
  user: mongoose.Types.ObjectId;
  resume: mongoose.Types.ObjectId;
  snapshot: Partial<IResume>;
  createdAt: Date;
  updatedAt: Date;
}

const resumeHistorySchema = new Schema<IResumeHistory>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  resume: {
    type: Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
    index: true,
  },
  snapshot: {
    type: Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

resumeHistorySchema.index({ resume: 1, createdAt: -1 });

export default mongoose.model<IResumeHistory>('ResumeHistory', resumeHistorySchema);

