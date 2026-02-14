/**
 * API Response Types
 * Centralized type definitions for all API responses
 */

// Base API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  code?: string;
  type?: string;
}

// Error Types
export interface ApiError extends Error {
  status?: number;
  type?: string;
  details?: {
    errors?: Array<string | { message?: string; path?: string | string[] }>;
    message?: string;
  };
  code?: string;
}

export interface ValidationError {
  message: string;
  path?: string | string[];
}

// Auth Types
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
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
  onboardingCompleted?: boolean;
  careerGoal?: 'new-job' | 'internship' | 'career-switch';
  subscription?: {
    plan: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse extends ApiResponse<{
  user: AuthUser;
  token: string;
}> {}

export interface RegisterResponse extends ApiResponse<{
  user: AuthUser;
  token: string;
}> {}

// Resume Types
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  website?: string;
}

export interface Experience {
  _id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current?: boolean;
}

export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current?: boolean;
}

export interface Resume {
  _id: string;
  user: string;
  title: string;
  personalInfo: PersonalInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  variantType?: 'general' | 'frontend' | 'backend' | 'fullstack' | 'qa' | 'designer' | 'devops' | 'data' | 'other';
  themeConfig?: {
    color: string;
    font: string;
    layout: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ResumeListResponse extends ApiResponse<Resume[]> {}
export interface ResumeResponse extends ApiResponse<Resume> {}

export interface AIEnhanceResponse extends ApiResponse<string> {}

export interface ATSAnalysisResponse extends ApiResponse<{
  score: number;
  suggestions: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
}> {}

// Interview Types
export type PersonaType = 
  | 'friendly-hr'
  | 'strict-manager'
  | 'english-native'
  | 'tech-lead'
  | 'startup-founder'
  | 'executive'
  | 'academic';

export interface InterviewMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Interview {
  _id: string;
  user: string;
  persona: PersonaType;
  messages: InterviewMessage[];
  startedAt: string;
  endedAt?: string;
  feedback?: {
    confidence: number;
    accuracy: number;
    suggestions: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface InterviewResponse extends ApiResponse<Interview> {}
export interface InterviewListResponse extends ApiResponse<Interview[]> {}
export interface InterviewChatResponse extends ApiResponse<{
  message: string;
  interview: Interview;
}> {}

// Post Types
export interface PostComment {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  likes: string[];
  parentId?: string;
  replies?: PostComment[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  image?: string;
  likes: string[];
  comments: PostComment[];
  createdAt: string;
  updatedAt: string;
}

export interface PostListResponse extends ApiResponse<Post[]> {}
export interface PostResponse extends ApiResponse<Post> {}

// Article Types
export interface Article {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  category: 'Tips CV' | 'Interview Hack' | 'Market News';
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  image?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListResponse extends ApiResponse<Article[]> {}
export interface ArticleResponse extends ApiResponse<Article> {}

// Job Types
export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  postedAt: string;
  expiresAt?: string;
  applicants?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JobListResponse extends ApiResponse<{
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {}

export interface JobResponse extends ApiResponse<Job> {}

// Dashboard Types
export interface DashboardStats {
  totalResumes: number;
  totalInterviews: number;
  totalJobsApplied: number;
  recentActivity: Array<{
    type: string;
    title: string;
    timestamp: string;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    action: string;
  }>;
}

export interface DashboardStatsResponse extends ApiResponse<DashboardStats> {}

// Notification Types
export interface Notification {
  _id: string;
  user: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationListResponse extends ApiResponse<Notification[]> {}

// Payment Types
export interface CheckoutSessionResponse extends ApiResponse<{
  sessionId: string;
  url: string;
}> {}

export interface SubscriptionStatusResponse extends ApiResponse<{
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  endDate?: string;
}> {}

// Upload Types
export interface UploadResponse extends ApiResponse<{
  avatar?: string;
  coverPhoto?: string;
  url?: string;
  filename?: string;
  size?: number;
}> {}

// Achievement Types
export interface Achievement {
  _id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt?: string;
}

export interface AchievementListResponse extends ApiResponse<Achievement[]> {}
export interface AchievementStatsResponse extends ApiResponse<{
  unlocked: number;
  total: number;
  recent: Achievement[];
}> {}

// Chat Types
export interface ChatResponse extends ApiResponse<{
  message: string;
}> {}

// News Types
export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  image?: string;
  source?: string;
}

export interface NewsResponse extends ApiResponse<{
  news: NewsItem[];
  count: number;
}> {}
