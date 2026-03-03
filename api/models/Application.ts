import mongoose, { Document, Schema } from 'mongoose';

export type ApplicationStatus = 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  recruiter: mongoose.Types.ObjectId;
  coverLetter?: string;
  status: ApplicationStatus;
  recruiterNotes?: string;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'],
      default: 'pending',
    },
    recruiterNotes: {
      type: String,
      trim: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications per job per applicant
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
// Recruiter inbox sorted by latest
applicationSchema.index({ recruiter: 1, appliedAt: -1 });
// Job seeker's own application history
applicationSchema.index({ applicant: 1, appliedAt: -1 });

export default mongoose.model<IApplication>('Application', applicationSchema);
