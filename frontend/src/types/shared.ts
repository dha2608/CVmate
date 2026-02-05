/**
 * Shared TypeScript types and interfaces
 * Used across frontend and backend
 */

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Response Type
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// User Types
export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  coverPhoto?: string;
  role: 'user' | 'admin';
  bio?: string;
  headline?: string;
  location?: string;
  yearsOfExperience?: number;
  currentRole?: string;
  industries?: string[];
  skills?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  isPublicProfile?: boolean;
  onboardingCompleted: boolean;
  careerGoal?: 'new-job' | 'internship' | 'career-switch';
  subscription?: {
    plan: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: Date;
    endDate?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Resume Types
export interface IPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  website: string;
}

export interface IExperience {
  id: string;
  _id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface IEducation {
  id: string;
  _id?: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface IResume {
  _id?: string;
  title: string;
  variantType?: 'general' | 'job-a' | 'job-b';
  personalInfo: IPersonalInfo;
  summary: string;
  experience: IExperience[];
  education: IEducation[];
  skills: string[];
  themeConfig?: {
    color: string;
    font: string;
    layout: 'standard' | 'modern' | 'minimalist' | 'two-column';
  };
  atsScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Job Types
export interface IJob {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Remote' | 'Contract' | 'Internship';
  description: string;
  salary?: string;
  requirements?: string[];
  logo?: string;
  postedAt: Date;
  applicants?: string[];
}

// Post Types
export interface IPost {
  _id: string;
  user: IUser;
  content: string;
  images?: string[];
  likes: string[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  _id: string;
  user: IUser;
  content: string;
  createdAt: Date;
}

// Interview Types
export interface IInterview {
  _id: string;
  user: string;
  persona: string;
  messages: IInterviewMessage[];
  status: 'active' | 'idle' | 'completed';
  startedAt: Date;
  endedAt?: Date;
  feedback?: {
    confidence: number;
    accuracy: number;
    suggestions: string[];
  };
}

export interface IInterviewMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Article Types
export interface IArticle {
  _id: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  author: IUser;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface INotification {
  _id: string;
  recipient: string;
  type: 'like' | 'comment' | 'job' | 'message' | 'system';
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

// Message Types
export interface IMessage {
  _id: string;
  sender: IUser;
  receiver: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

// Form Field Types
export type ResumeField = keyof IResume;
export type PersonalInfoField = keyof IPersonalInfo;

// Update Field Value Type
export type UpdateFieldValue = 
  | string 
  | string[] 
  | IExperience[] 
  | IEducation[] 
  | IPersonalInfo;
