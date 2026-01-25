import mongoose, { Document, Schema } from 'mongoose';

// Interface cho Experience (Kinh nghiệm làm việc)
export interface IExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  _id?: mongoose.Types.ObjectId;
}

// Interface cho Education (Học vấn)
export interface IEducation {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
  _id?: mongoose.Types.ObjectId;
}

// Interface cho Theme Config (Cấu hình giao diện CV)
export interface IThemeConfig {
  color: string;
  font: string;
  layout: 'standard' | 'modern' | 'minimalist' | 'two-column'; // Định nghĩa các layout cho phép
}

// Interface chính cho Resume
export interface IResume extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: IExperience[];
  education: IEducation[];
  skills: string[];
  themeConfig: IThemeConfig;
  atsScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// --- Schemas Definition ---

const experienceSchema = new Schema<IExperience>({
  company: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  startDate: { type: String, trim: true },
  endDate: { type: String, trim: true },
  description: { type: String },
});

const educationSchema = new Schema<IEducation>({
  institution: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  startDate: { type: String, trim: true },
  endDate: { type: String, trim: true },
  description: { type: String },
});

const resumeSchema = new Schema<IResume>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // Tối ưu query tìm CV theo User
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    default: 'My Resume' 
  },
  personalInfo: {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  summary: { 
    type: String,
    trim: true 
  },
  experience: [experienceSchema],
  education: [educationSchema],
  skills: [{ 
    type: String,
    trim: true 
  }],
  themeConfig: {
    color: { type: String, default: '#000000' },
    font: { type: String, default: 'Inter' },
    layout: { type: String, default: 'standard' },
  },
  atsScore: { 
    type: Number, 
    default: 0 
  },
}, { 
  timestamps: true 
});

export default mongoose.model<IResume>('Resume', resumeSchema);