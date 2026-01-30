import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
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

// API Request Helper
interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

export const apiRequest = async <T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const { requiresAuth = true, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Specific API Methods
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest<{ success: boolean; data: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requiresAuth: false,
    }),

  register: (name: string, email: string, password: string) =>
    apiRequest<{ success: boolean; data: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      requiresAuth: false,
    }),

  getMe: () => apiRequest<{ success: boolean; data: any }>('/auth/me'),

  // Resume
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
    apiRequest<{ success: boolean; data: string }>('/resumes/ai-enhance', {
      method: 'POST',
      body: JSON.stringify({ text, type }),
    }),

  analyzeResume: (id: string) =>
    apiRequest<{ success: boolean; data: any }>(`/resumes/${id}/analyze`, {
      method: 'POST',
    }),

  // Interview
  startInterview: (personaType: string) =>
    apiRequest<{ success: boolean; data: any }>('/interviews/start', {
      method: 'POST',
      body: JSON.stringify({ personaType }),
    }),

  sendInterviewMessage: (interviewId: string, message: string) =>
    apiRequest<{ success: boolean; data: any }>(`/interviews/${interviewId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Dashboard
  getDashboardStats: () =>
    apiRequest<{ success: boolean; data: any }>('/dashboard/stats'),

  // Posts
  getPosts: () => apiRequest<{ success: boolean; data: any[] }>('/posts'),
  
  createPost: (content: string, imageUrl?: string) =>
    apiRequest<{ success: boolean; data: any }>('/posts', {
      method: 'POST',
      body: JSON.stringify({ content, imageUrl }),
    }),

  likePost: (postId: string) =>
    apiRequest<{ success: boolean; data: any }>(`/posts/${postId}/like`, {
      method: 'POST',
    }),

  commentPost: (postId: string, content: string) =>
    apiRequest<{ success: boolean; data: any }>(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Articles
  getArticles: () => apiRequest<{ success: boolean; data: any[] }>('/articles'),
  
  getArticle: (id: string) => apiRequest<{ success: boolean; data: any }>(`/articles/${id}`),
};
