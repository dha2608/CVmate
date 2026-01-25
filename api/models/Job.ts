import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Remote' | 'Contract' | 'Internship';
  salary?: string;
  description: string;
  requirements: string[];
  logo?: string;
  postedAt: Date;
  postedBy: mongoose.Types.ObjectId;
  applicants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'],
    required: true
  },
  salary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String
  }],
  logo: {
    type: String
  },
  postedAt: {
    type: Date,
    default: Date.now
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

jobSchema.index({ title: 'text', company: 'text', description: 'text', location: 'text' });
jobSchema.index({ postedAt: -1 });

export default mongoose.model<IJob>('Job', jobSchema);