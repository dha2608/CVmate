import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ApiResponse, IExperience, IEducation } from "@/types/shared"

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
  log: (...args: any[]) => {
    if (isDev && !isProduction) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, but only in dev show full details
    if (isDev) {
      console.error(...args);
    } else {
      // In production, log minimal error info
      console.error('[Error]', args[0]);
    }
  },
  warn: (...args: any[]) => {
    if (isDev && !isProduction) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
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

export const apiRequest = async <T = any>(
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
      let errorDetails: any = undefined;
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || `HTTP error! status: ${response.status}`;
      errorType = error.type || 'unknown'; // 'server_rate_limit' or 'openai_api_error'
      errorDetails = error;
    } catch {
      // If JSON parsing fails, use status-based messages
      if (response.status === 503) {
        errorMessage = 'Service temporarily unavailable. Please try again in a few moments.';
      } else if (response.status === 429) {
        // Check response headers for rate limit info
        const retryAfter = response.headers.get('Retry-After');
        const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
        const retryMinutes = Math.ceil(retrySeconds / 60);
        const retryMessage = retryAfter 
          ? ` Please try again after ${retryMinutes} minute${retryMinutes > 1 ? 's' : ''}.` 
          : ' Please wait a few minutes and try again.';
        errorMessage = `Too many requests.${retryMessage}`;
        errorType = 'server_rate_limit';
      } else if (response.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (response.status === 404) {
        errorMessage = 'Resource not found.';
      } else {
        errorMessage = `HTTP error! status: ${response.status}`;
      }
    }
    
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).type = errorType;
    (error as any).details = errorDetails;
    throw error;
  }

  return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Handle timeout/abort errors
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      const timeoutError = new Error('Request timeout. Please check your connection and try again.');
      (timeoutError as any).type = 'timeout';
      (timeoutError as any).status = 408;
      throw timeoutError;
    }
    
    // Re-throw other errors
    throw error;
  }
};

export const api = {
  login: (email: string, password: string) =>
    apiRequest<{ success: boolean; data: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requiresAuth: false,
      timeout: AUTH_TIMEOUT,
    }),

  register: (name: string, email: string, password: string) =>
    apiRequest<{ success: boolean; data?: any; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      requiresAuth: false,
      timeout: AUTH_TIMEOUT,
    }),

  getMe: () => apiRequest<{ success: boolean; data: any }>('/auth/me'),

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
    apiRequest<{ success: boolean; data: any }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getResumes: () => apiRequest<{ success: boolean; data: any[] }>('/resumes'),
  
  getResume: (id: string) => apiRequest<{ success: boolean; data: any }>(`/resumes/${id}`),
  
  createResume: (data: any) =>
    apiRequest<{ success: boolean; data: any }>('/resumes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateResume: (id: string, data: any) =>
    apiRequest<{ success: boolean; data: any }>(`/resumes/${id}`, {
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
    apiRequest<{ success: boolean; data: any }>(`/resumes/${id}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ jobDescription }),
    }),

  completeOnboarding: (careerGoal: 'new-job' | 'internship' | 'career-switch') =>
    apiRequest<{ success: boolean; data: any }>('/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify({ careerGoal }),
    }),

  startInterview: (persona: string) =>
    apiRequest<{ success: boolean; data: any }>('/interviews/start', {
      method: 'POST',
      body: JSON.stringify({ persona }),
    }),

  sendInterviewMessage: (interviewId: string, message: string) =>
    apiRequest<{ success: boolean; data: any }>(`/interviews/${interviewId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  endInterview: (interviewId: string) =>
    apiRequest<{ success: boolean; data: any }>(`/interviews/${interviewId}/end`, {
      method: 'POST',
    }),

  getInterview: (interviewId: string) =>
    apiRequest<{ success: boolean; data: any }>(`/interviews/${interviewId}`),

  getInterviews: () =>
    apiRequest<{ success: boolean; data: any[] }>('/interviews'),

  getDashboardStats: () =>
    apiRequest<{ success: boolean; data: any }>('/dashboard/stats'),

  getPosts: () => apiRequest<{ success: boolean; data: any[] }>('/posts'),
  
  createPost: (content: string, imageUrl?: string) =>
    apiRequest<{ success: boolean; data: any }>('/posts', {
      method: 'POST',
      body: JSON.stringify({ content, image: imageUrl }),
    }),

  likePost: (postId: string) =>
    apiRequest<{ success: boolean; data: any }>(`/posts/${postId}/like`, {
      method: 'PUT',
    }),

  commentPost: (postId: string, content: string, parentId?: string) =>
    apiRequest<{ success: boolean; data: any }>(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text: content, parentId }),
    }),

  likeComment: (postId: string, commentId: string) =>
    apiRequest<{ success: boolean; data: any }>(`/posts/${postId}/comment/${commentId}/like`, {
      method: 'PUT',
    }),

  updateComment: (postId: string, commentId: string, text: string) =>
    apiRequest<{ success: boolean; data: any }>(`/posts/${postId}/comment/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    }),

  deleteComment: (postId: string, commentId: string) =>
    apiRequest<{ success: boolean; data: any }>(`/posts/${postId}/comment/${commentId}`, {
      method: 'DELETE',
    }),

  getAchievements: () =>
    apiRequest<{ success: boolean; data: any[] }>('/achievements'),

  getAchievementStats: () =>
    apiRequest<{ success: boolean; data: any }>('/achievements/stats'),

  getArticles: () => apiRequest<{ success: boolean; data: any[] }>('/articles'),
  
  getArticle: (id: string) => apiRequest<{ success: boolean; data: any }>(`/articles/${id}`),

  getNews: (limit?: number) =>
    apiRequest<{ success: boolean; data: any[]; count: number }>(`/news?limit=${limit || 20}`, {
      requiresAuth: false,
    }),

  refreshNews: () =>
    apiRequest<{ success: boolean; data: any[]; count: number }>('/news/refresh', {
      method: 'POST',
      requiresAuth: false,
    }),

  createCheckoutSession: () =>
    apiRequest<{ success: boolean; data: { sessionId: string; url: string } }>('/payment/create-checkout-session', {
      method: 'POST',
    }),

  getSubscriptionStatus: () =>
    apiRequest<{ success: boolean; data: { plan: string; status: string; endDate?: string } }>('/payment/subscription-status'),

  cancelSubscription: () =>
    apiRequest<{ success: boolean;       message: string }>('/payment/cancel-subscription', {
      method: 'POST',
    }),

  createPayPalOrder: () =>
    apiRequest<{ success: boolean; data: { orderId: string; amount: { value: string; currency: string } } }>('/payment/paypal/create-order', {
      method: 'POST',
    }),

  capturePayPalPayment: (orderId: string) =>
    apiRequest<{ success: boolean; message: string; data: { subscription: any } }>('/payment/paypal/capture', {
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
             apiRequest<ApiResponse<{ avatar: string }>>('/upload/avatar', {
               method: 'POST',
               body: formData,
               headers: {}, // Important: do not set Content-Type for FormData
             }),
           uploadCoverPhoto: (formData: FormData) =>
             apiRequest<ApiResponse<{ coverPhoto: string }>>('/upload/cover-photo', {
               method: 'POST',
               body: formData,
               headers: {}, // Important: do not set Content-Type for FormData
             }),
           uploadPostImage: (formData: FormData) =>
             apiRequest<ApiResponse<{ url: string; filename: string; size: number }>>('/upload/post-image', {
               method: 'POST',
               body: formData,
               headers: {}, // Important: do not set Content-Type for FormData
             }),
         },
       };
