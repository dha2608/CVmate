import mongoose, { type Document } from 'mongoose';

export interface IJobAlert extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  filters: {
    search?: string;
    type?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    experienceLevel?: string;
    companySize?: string;
  };
  active: boolean;
  lastNotifiedAt?: Date;
  matchCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobAlertSchema = new mongoose.Schema<IJobAlert>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    filters: {
      search: { type: String, trim: true },
      type: { type: String, trim: true },
      location: { type: String, trim: true },
      salaryMin: { type: Number },
      salaryMax: { type: Number },
      experienceLevel: { type: String, trim: true },
      companySize: { type: String, trim: true },
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastNotifiedAt: {
      type: Date,
    },
    matchCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: find active alerts efficiently
jobAlertSchema.index({ active: 1, user: 1 });

// Limit alerts per user (max 10)
jobAlertSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IJobAlert>('JobAlert', jobAlertSchema);
