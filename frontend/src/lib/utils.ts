import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ApiResponse, IExperience, IEducation } from '@/types/shared';
import { apiRequest, authApi, uploadApi } from './apiClient';
import { logger } from './logger';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export API helpers to preserve existing imports
export { apiRequest, authApi, uploadApi };
export { logger };

export const api = {
  // Auth
  login: authApi.login,
  register: authApi.register,
  getMe: authApi.getMe,
  updateProfile: authApi.updateProfile,

  // Resumes
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
    apiRequest<
      ApiResponse<{
        summary: string;
        experience: IExperience[];
        education: IEducation[];
        skills: string[];
      }>
    >('/resumes/ai-generate-full', {
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

  // Interviews
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

  getInterviews: () => apiRequest<{ success: boolean; data: any[] }>('/interviews'),

  // Dashboard
  getDashboardStats: () => apiRequest<{ success: boolean; data: any }>('/dashboard/stats'),
  getActivities: (limit = 10) =>
    apiRequest<{ success: boolean; data: any[] }>(`/dashboard/activities?limit=${limit}`),

  // Community / Posts
  getPosts: (page = 1, limit = 10, sort = 'new', search = '') =>
    apiRequest<{
      success: boolean;
      data: any[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(
      `/posts?page=${page}&limit=${limit}&sort=${sort}${search ? `&search=${encodeURIComponent(search)}` : ''}`
    ),

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

  updatePost: (postId: string, content: string, image?: string) =>
    apiRequest<{ success: boolean; data: any }>(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify({ content, image }),
    }),

  deletePost: (postId: string) =>
    apiRequest<{ success: boolean; message: string }>(`/posts/${postId}`, {
      method: 'DELETE',
    }),

  followUser: (userId: string) =>
    apiRequest<{
      success: boolean;
      data: { isFollowing: boolean; followersCount: number; followingCount: number };
    }>(`/auth/users/${userId}/follow`, {
      method: 'POST',
    }),

  // Achievements
  getAchievements: () => apiRequest<{ success: boolean; data: any[] }>('/achievements'),

  getAchievementStats: () => apiRequest<{ success: boolean; data: any }>('/achievements/stats'),

  // Articles & News
  getArticles: (page = 1, limit = 9, category?: string, search?: string) =>
    apiRequest<{
      success: boolean;
      data: any[];
      pagination?: { page: number; limit: number; total: number; pages: number };
    }>(
      `/articles?page=${page}&limit=${limit}${category ? `&category=${encodeURIComponent(category)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
      { requiresAuth: false }
    ),

  getArticle: (id: string) => apiRequest<{ success: boolean; data: any }>(`/articles/${id}`),

  createArticle: (payload: { title: string; content: string; category?: string; image?: string }) =>
    apiRequest<{ success: boolean; data: any; message?: string }>('/articles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  likeArticle: (id: string) =>
    apiRequest<{ success: boolean; data: { likes: number; isLiked: boolean } }>(
      `/articles/${id}/like`,
      {
        method: 'POST',
      }
    ),

  addArticleComment: (id: string, content: string) =>
    apiRequest<{ success: boolean; data: any }>(`/articles/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  deleteArticleComment: (id: string, commentId: string) =>
    apiRequest<{ success: boolean }>(`/articles/${id}/comments/${commentId}`, {
      method: 'DELETE',
    }),

  getNews: (limit?: number) =>
    apiRequest<{ success: boolean; data: any[]; count: number }>(`/news?limit=${limit || 20}`, {
      requiresAuth: false,
    }),

  refreshNews: () =>
    apiRequest<{ success: boolean; data: any[]; count: number }>('/news/refresh', {
      method: 'POST',
      requiresAuth: false,
    }),

  // Payments
  createCheckoutSession: (billingCycle: 'monthly' | 'yearly' = 'monthly') =>
    apiRequest<{
      success: boolean;
      data: { sessionId: string; url: string };
    }>('/payment/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ billingCycle }),
    }),

  verifyCheckoutSession: (sessionId: string) =>
    apiRequest<{
      success: boolean;
      data: { plan: string; status: string; endDate?: string };
    }>('/payment/verify-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),

  getSubscriptionStatus: () =>
    apiRequest<{
      success: boolean;
      data: { plan: string; status: string; endDate?: string };
    }>('/payment/subscription-status'),

  cancelSubscription: () =>
    apiRequest<{ success: boolean; message: string }>('/payment/cancel-subscription', {
      method: 'POST',
    }),

  switchPlan: (billingCycle: 'monthly' | 'yearly') =>
    apiRequest<ApiResponse<unknown>>('/payment/switch-plan', {
      method: 'POST',
      body: JSON.stringify({ billingCycle }),
    }),

  createPayPalOrder: () =>
    apiRequest<{
      success: boolean;
      data: { orderId: string; amount: { value: string; currency: string } };
    }>('/payment/paypal/create-order', {
      method: 'POST',
    }),

  capturePayPalPayment: (orderId: string) =>
    apiRequest<{
      success: boolean;
      message: string;
      data: { subscription: any };
    }>('/payment/paypal/capture', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),

  // Jobs
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
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.salaryMin) queryParams.append('salaryMin', params.salaryMin.toString());
    if (params?.salaryMax) queryParams.append('salaryMax', params.salaryMax.toString());
    if (params?.experienceLevel) queryParams.append('experienceLevel', params.experienceLevel);
    if (params?.companySize) queryParams.append('companySize', params.companySize);

    return apiRequest<{
      success: boolean;
      data: any[];
      pagination: any;
    }>(`/jobs?${queryParams.toString()}`);
  },

  getJob: (id: string) => apiRequest<{ success: boolean; data: any }>(`/jobs/${id}`),

  createJob: (data: any) =>
    apiRequest<{ success: boolean; data: any }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  applyJob: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/jobs/${id}/apply`, {
      method: 'POST',
    }),

  applyToJob: (jobId: string, coverLetter?: string) =>
    apiRequest<{ success: boolean; message: string }>(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ coverLetter }),
    }),

  getMyPostedJobs: () => apiRequest<{ success: boolean; data: any[] }>('/jobs/my-posts'),

  getMyApplications: () => apiRequest<{ success: boolean; data: any[] }>('/jobs/my-applications'),

  getJobApplications: (jobId: string) =>
    apiRequest<{ success: boolean; data: any[] }>(`/jobs/${jobId}/applications`),

  updateApplicationStatus: (jobId: string, appId: string, status: string, notes?: string) =>
    apiRequest<{ success: boolean; data: any }>(`/jobs/${jobId}/applications/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, recruiterNotes: notes }),
    }),

  // Admin
  getAdminOverview: () => apiRequest<{ success: boolean; data: any }>('/admin/overview'),

  getAdminUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    return apiRequest<{ success: boolean; data: any[]; pagination: any }>(
      `/admin/users?${queryParams.toString()}`
    );
  },

  updateAdminUserRole: (userId: string, role: 'user' | 'admin') =>
    apiRequest<{ success: boolean; data: any }>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  updateAdminUserSubscription: (
    userId: string,
    payload: {
      plan: 'free' | 'premium';
      status: 'active' | 'cancelled' | 'expired';
      endDate?: string;
    }
  ) =>
    apiRequest<{ success: boolean; data: any }>(`/admin/users/${userId}/subscription`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  banAdminUser: (userId: string) =>
    apiRequest<{ success: boolean; message: string }>(`/admin/users/${userId}/ban`, {
      method: 'PUT',
    }),

  unbanAdminUser: (userId: string) =>
    apiRequest<{ success: boolean; message: string }>(`/admin/users/${userId}/unban`, {
      method: 'PUT',
    }),

  getAdminPosts: (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.status) queryParams.append('status', params.status);
    return apiRequest<{ success: boolean; data: any[]; pagination: any }>(
      `/admin/posts?${queryParams.toString()}`
    );
  },

  updateAdminPostStatus: (
    postId: string,
    status: 'pending' | 'approved' | 'rejected',
    reason?: string
  ) =>
    apiRequest<{ success: boolean; data: any }>(`/admin/posts/${postId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    }),

  deleteAdminPost: (postId: string) =>
    apiRequest<{ success: boolean; message: string }>(`/admin/posts/${postId}`, {
      method: 'DELETE',
    }),

  getAdminArticles: (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    return apiRequest<{ success: boolean; data: any[]; pagination: any }>(
      `/admin/articles?${queryParams.toString()}`
    );
  },

  toggleAdminArticlePublish: (articleId: string) =>
    apiRequest<{ success: boolean; data: any }>(`/admin/articles/${articleId}/toggle-publish`, {
      method: 'PUT',
    }),

  deleteAdminArticle: (articleId: string) =>
    apiRequest<{ success: boolean; message: string }>(`/admin/articles/${articleId}`, {
      method: 'DELETE',
    }),

  getAdminJobs: (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    return apiRequest<{ success: boolean; data: any[]; pagination: any }>(
      `/admin/jobs?${queryParams.toString()}`
    );
  },

  deleteAdminJob: (jobId: string) =>
    apiRequest<{ success: boolean; message: string }>(`/admin/jobs/${jobId}`, {
      method: 'DELETE',
    }),

  // Chat / AI
  chatWithAI: (message: string, conversationHistory?: Array<{ type: string; text: string }>) =>
    apiRequest<{ success: boolean; data: { message: string } }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationHistory }),
    }),

  // User search
  searchUsers: (q: string, page = 1, limit = 10) =>
    apiRequest<{
      success: boolean;
      data: Array<{
        _id: string;
        name: string;
        avatar?: string;
        headline?: string;
        skills?: string[];
        currentRole?: string;
        location?: string;
      }>;
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/auth/users/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),

  // Followers/Following lists
  getFollowers: (userId: string, page = 1, limit = 20) =>
    apiRequest<{
      success: boolean;
      data: Array<{
        _id: string;
        name: string;
        avatar?: string;
        headline?: string;
        currentRole?: string;
      }>;
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/auth/users/${userId}/followers?page=${page}&limit=${limit}`, { requiresAuth: false }),

  getFollowing: (userId: string, page = 1, limit = 20) =>
    apiRequest<{
      success: boolean;
      data: Array<{
        _id: string;
        name: string;
        avatar?: string;
        headline?: string;
        currentRole?: string;
      }>;
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/auth/users/${userId}/following?page=${page}&limit=${limit}`, { requiresAuth: false }),

  // User achievements (public)
  getUserAchievements: (userId: string) =>
    apiRequest<{
      success: boolean;
      data: Array<{
        _id: string;
        type: string;
        unlockedAt: string;
        metadata?: Record<string, unknown>;
      }>;
    }>(`/auth/users/${userId}/achievements`, { requiresAuth: false }),

  // User posts
  getUserPosts: (userId: string, page = 1, limit = 10) =>
    apiRequest<{
      success: boolean;
      data: any[];
      pagination?: { page: number; limit: number; total: number; pages: number };
    }>(`/posts?author=${userId}&page=${page}&limit=${limit}`, { requiresAuth: false }),

  // Job Alerts
  getJobAlerts: () => apiRequest<{ success: boolean; alerts: any[] }>('/job-alerts'),

  createJobAlert: (name: string, filters: Record<string, any>) =>
    apiRequest<{ success: boolean; alert: any }>('/job-alerts', {
      method: 'POST',
      body: JSON.stringify({ name, filters }),
    }),

  deleteJobAlert: (id: string) =>
    apiRequest<{ success: boolean }>(`/job-alerts/${id}`, { method: 'DELETE' }),

  toggleJobAlert: (id: string) =>
    apiRequest<{ success: boolean; alert: any }>(`/job-alerts/${id}/toggle`, {
      method: 'PATCH',
    }),

  // Uploads
  upload: uploadApi,
};
