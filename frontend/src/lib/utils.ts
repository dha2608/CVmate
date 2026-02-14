import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ApiResponse, IExperience, IEducation, IResume } from "@/types/shared"
import type { 
  AuthUser, 
  LoginResponse, 
  RegisterResponse,
  Resume,
  ResumeListResponse,
  ResumeResponse,
  Interview,
  InterviewResponse,
  InterviewListResponse,
  Post,
  PostListResponse,
  PostResponse,
  Article,
  ArticleListResponse,
  ArticleResponse,
  Job,
  JobListResponse,
  JobResponse,
  DashboardStatsResponse,
  NotificationListResponse,
  CheckoutSessionResponse,
  SubscriptionStatusResponse,
  UploadResponse,
  AchievementListResponse,
  AchievementStatsResponse,
  NewsResponse
} from "@/types/api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize image URL - convert relative paths to full URLs
 * Handles both relative paths (/uploads/...) and full URLs (http://...)
 */
export const normalizeImageUrl = (url: string | undefined | null): string | null => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  
  // Already a full URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // Relative path - convert to full URL
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    // Remove /api suffix if present
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4);
    }
    // Remove trailing slash
    baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // Ensure path starts with /
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${baseUrl}${path}`;
  }
  
  // Return as-is if it doesn't match known patterns
  return trimmed;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Logger utility - only logs in development
// Check both DEV and MODE to ensure we're truly in development
const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production' || import.meta.env.PROD;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev && !isProduction) {
      console.log(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors, but only in dev show full details
    if (isDev) {
      console.error(...args);
    } else {
      // In production, log minimal error info
      console.error('[Error]', args[0]);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev && !isProduction) {
      console.warn(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDev && !isProduction) {
      console.info(...args);
    }
  },
};

if (isDev && !isProduction) {
  logger.log('🔗 API Base URL:', API_BASE_URL);
}

const getAuthToken = (): string | null => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token || null;
    } catch {
      return null;
    }
  }
  return null;
};
interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
  timeout?: number; // Timeout in milliseconds
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds default timeout
const AUTH_TIMEOUT = 15000; // 15 seconds for auth endpoints (login/register)

export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const { requiresAuth = true, timeout, ...fetchOptions } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  // Debug logging (development only)
  if (isDev) {
    logger.log('📤 API Request:', url, { method: fetchOptions.method || 'GET' });
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout || DEFAULT_TIMEOUT);

  try {
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
      signal: controller.signal,
  });

    clearTimeout(timeoutId);

  if (!response.ok) {
      let errorMessage = 'Request failed';
      let errorType = 'unknown';
      let errorDetails: unknown = undefined;
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || getUserFriendlyMessage(error);
      errorType = error.type || extractErrorCode(error);
      errorDetails = error;
    } catch {
      // If JSON parsing fails, use status-based messages
      const errorCode = extractErrorCode({ status: response.status });
      errorMessage = getUserFriendlyMessage({ status: response.status, code: errorCode });
      errorType = errorCode;
      
      // Add retry information for rate limits
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        if (retryAfter) {
          const retrySeconds = parseInt(retryAfter, 10);
          const retryMinutes = Math.ceil(retrySeconds / 60);
          errorMessage += ` Please try again after ${retryMinutes} minute${retryMinutes > 1 ? 's' : ''}.`;
        }
      }
    }
    
    const error = new Error(errorMessage) as Error & {
      status?: number;
      type?: string;
      code?: ErrorCode;
      details?: unknown;
    };
    error.status = response.status;
    error.type = errorType;
    error.code = extractErrorCode({ status: response.status, type: errorType });
    error.details = errorDetails;
    throw error;
  }

  return response.json();
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    
    // Handle timeout/abort errors
    if (isTimeoutError(error) || (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError'))) {
      const timeoutError = new Error(getUserFriendlyMessage(error)) as Error & {
        type?: string;
        status?: number;
        code?: ErrorCode;
      };
      timeoutError.type = 'timeout';
      timeoutError.status = 408;
      timeoutError.code = ErrorCode.TIMEOUT;
      throw timeoutError;
    }
    
    // Handle network errors
    if (isNetworkError(error)) {
      const networkError = new Error(getUserFriendlyMessage(error)) as Error & {
        type?: string;
        code?: ErrorCode;
      };
      networkError.type = 'network';
      networkError.code = ErrorCode.NETWORK_ERROR;
      throw networkError;
    }
    
    // Re-throw other errors
    throw error;
  }
};

export const api = {
  login: (email: string, password: string) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requiresAuth: false,
      timeout: AUTH_TIMEOUT,
    }),

  register: (name: string, email: string, password: string) =>
    apiRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      requiresAuth: false,
      timeout: AUTH_TIMEOUT,
    }),

  getMe: () => apiRequest<ApiResponse<AuthUser>>('/auth/me'),

  updateProfile: (payload: {
    name?: string; 
    avatar?: string;
    coverPhoto?: string; 
    email?: string; 
    password?: string;
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
  }) =>
    apiRequest<ApiResponse<AuthUser>>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getResumes: () => apiRequest<ResumeListResponse>('/resumes'),
  
  getResume: (id: string) => apiRequest<ResumeResponse>(`/resumes/${id}`),
  
  createResume: (data: IResume) =>
    apiRequest<ResumeResponse>('/resumes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateResume: (id: string, data: Partial<IResume>) =>
    apiRequest<ResumeResponse>(`/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteResume: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/resumes/${id}`, {
      method: 'DELETE',
    }),

  aiEnhance: (text: string, type?: string) =>
    apiRequest<ApiResponse<string>>('/resumes/ai-enhance', {
      method: 'POST',
      body: JSON.stringify({ text, type }),
    }),

  aiGenerateFullResume: (payload: { 
    prompt?: string; 
    jobDescription?: string;
    role?: 'frontend' | 'backend' | 'fullstack' | 'qa' | 'designer' | 'devops' | 'data' | 'other';
    mode?: 'concise' | 'human';
  }) =>
    apiRequest<ApiResponse<{ summary: string; experience: IExperience[]; education: IEducation[]; skills: string[] }>>('/resumes/ai-generate-full', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  analyzeResume: (id: string, jobDescription?: string) =>
    apiRequest<ApiResponse<{
      score: number;
      suggestions: string[];
      missingKeywords: string[];
      matchedKeywords: string[];
    }>>(`/resumes/${id}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ jobDescription }),
    }),

  completeOnboarding: (careerGoal: 'new-job' | 'internship' | 'career-switch') =>
    apiRequest<ApiResponse<AuthUser>>('/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify({ careerGoal }),
    }),

  startInterview: (persona: string) =>
    apiRequest<InterviewResponse>('/interviews/start', {
      method: 'POST',
      body: JSON.stringify({ persona }),
    }),

  sendInterviewMessage: (interviewId: string, message: string) =>
    apiRequest<ApiResponse<{
      message: string;
      interview: Interview;
    }>>(`/interviews/${interviewId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  endInterview: (interviewId: string) =>
    apiRequest<InterviewResponse>(`/interviews/${interviewId}/end`, {
      method: 'POST',
    }),

  getInterview: (interviewId: string) =>
    apiRequest<InterviewResponse>(`/interviews/${interviewId}`),

  getInterviews: () =>
    apiRequest<InterviewListResponse>('/interviews'),

  getDashboardStats: () =>
    apiRequest<DashboardStatsResponse>('/dashboard/stats'),

  getPosts: () => apiRequest<PostListResponse>('/posts'),
  
  createPost: (content: string, imageUrl?: string) =>
    apiRequest<PostResponse>('/posts', {
      method: 'POST',
      body: JSON.stringify({ content, image: imageUrl }),
    }),

  likePost: (postId: string) =>
    apiRequest<PostResponse>(`/posts/${postId}/like`, {
      method: 'PUT',
    }),

  commentPost: (postId: string, content: string, parentId?: string) =>
    apiRequest<PostResponse>(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text: content, parentId }),
    }),

  likeComment: (postId: string, commentId: string) =>
    apiRequest<PostResponse>(`/posts/${postId}/comment/${commentId}/like`, {
      method: 'PUT',
    }),

  updateComment: (postId: string, commentId: string, text: string) =>
    apiRequest<PostResponse>(`/posts/${postId}/comment/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    }),

  deleteComment: (postId: string, commentId: string) =>
    apiRequest<ApiResponse<Post>>(`/posts/${postId}/comment/${commentId}`, {
      method: 'DELETE',
    }),

  getAchievements: () =>
    apiRequest<AchievementListResponse>('/achievements'),

  getAchievementStats: () =>
    apiRequest<AchievementStatsResponse>('/achievements/stats'),

  getArticles: () => apiRequest<ArticleListResponse>('/articles'),
  
  getArticle: (id: string) => apiRequest<ArticleResponse>(`/articles/${id}`),

  getNews: (limit?: number) =>
    apiRequest<NewsResponse>(`/news?limit=${limit || 20}`, {
      requiresAuth: false,
    }),

  refreshNews: () =>
    apiRequest<NewsResponse>('/news/refresh', {
      method: 'POST',
      requiresAuth: false,
    }),

  createCheckoutSession: () =>
    apiRequest<CheckoutSessionResponse>('/payment/create-checkout-session', {
      method: 'POST',
    }),

  getSubscriptionStatus: () =>
    apiRequest<SubscriptionStatusResponse>('/payment/subscription-status'),

  cancelSubscription: () =>
    apiRequest<ApiResponse<{ message: string }>>('/payment/cancel-subscription', {
      method: 'POST',
    }),

  createPayPalOrder: () =>
    apiRequest<ApiResponse<{ orderId: string; amount: { value: string; currency: string } }>>('/payment/paypal/create-order', {
      method: 'POST',
    }),

  capturePayPalPayment: (orderId: string) =>
    apiRequest<ApiResponse<{ subscription: AuthUser['subscription'] }>>('/payment/paypal/capture', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),

  getJobs: (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    type?: string; 
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    experienceLevel?: string;
    companySize?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.type) {
      queryParams.append('type', params.type);
    }
    if (params?.location) {
      queryParams.append('location', params.location);
    }
    if (params?.salaryMin) {
      queryParams.append('salaryMin', params.salaryMin.toString());
    }
    if (params?.salaryMax) {
      queryParams.append('salaryMax', params.salaryMax.toString());
    }
    if (params?.experienceLevel) {
      queryParams.append('experienceLevel', params.experienceLevel);
    }
    if (params?.companySize) {
      queryParams.append('companySize', params.companySize);
    }
    return apiRequest<{ success: boolean; data: any[]; pagination: any }>(`/jobs?${queryParams.toString()}`);
  },

  getJob: (id: string) =>
    apiRequest<{ success: boolean; data: any }>(`/jobs/${id}`),

  createJob: (data: any) =>
    apiRequest<{ success: boolean; data: any }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  applyJob: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/jobs/${id}/apply`, {
      method: 'POST',
    }),

         chatWithAI: (message: string, conversationHistory?: Array<{ type: string; text: string }>) =>
           apiRequest<{ success: boolean; data: { message: string } }>('/chat', {
             method: 'POST',
             body: JSON.stringify({ message, conversationHistory }),
           }),

         upload: {
           uploadAvatar: (formData: FormData) =>
             apiRequest<UploadResponse>('/upload/avatar', {
               method: 'POST',
               body: formData,
               headers: {}, // Important: do not set Content-Type for FormData
             }),
           uploadCoverPhoto: (formData: FormData) =>
             apiRequest<UploadResponse>('/upload/cover-photo', {
               method: 'POST',
               body: formData,
               headers: {}, // Important: do not set Content-Type for FormData
             }),
           uploadPostImage: (formData: FormData) =>
             apiRequest<UploadResponse>('/upload/post-image', {
               method: 'POST',
               body: formData,
               headers: {}, // Important: do not set Content-Type for FormData
             }),
         },
       };
