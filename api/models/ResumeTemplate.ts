import mongoose, { Document, Schema } from 'mongoose';

export interface IResumeTemplate extends Document {
  key: string;
  name: string;
  description: string;
  previewImage?: string;
  layout: 'standard' | 'modern' | 'minimalist' | 'two-column';
  defaultTheme: {
    color: string;
    font: string;
  };
  tags: string[];
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resumeTemplateSchema = new Schema<IResumeTemplate>({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  previewImage: {
    type: String,
    trim: true,
  },
  layout: {
    type: String,
    enum: ['standard', 'modern', 'minimalist', 'two-column'],
    default: 'standard',
  },
  defaultTheme: {
    color: { type: String, default: '#0F172A' },
    font: { type: String, default: 'Inter' },
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  isPremium: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

resumeTemplateSchema.index({ key: 1 });
resumeTemplateSchema.index({ isPremium: 1 });
resumeTemplateSchema.index({ tags: 1 });

export default mongoose.model<IResumeTemplate>('ResumeTemplate', resumeTemplateSchema);

