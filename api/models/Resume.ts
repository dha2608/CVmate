import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  company: String,
  position: String,
  startDate: String,
  endDate: String,
  description: String,
});

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  startDate: String,
  endDate: String,
  description: String,
});

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    linkedin: String,
    website: String,
  },
  summary: String,
  experience: [experienceSchema],
  education: [educationSchema],
  skills: [String],
  themeConfig: {
    color: { type: String, default: '#000000' },
    font: { type: String, default: 'Inter' },
    layout: { type: String, default: 'standard' },
  },
  atsScore: { type: Number, default: 0 },
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
