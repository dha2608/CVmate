/**
 * Common Types
 * Shared types used across the application
 */

// API Error with status code
export interface ApiError extends Error {
  status?: number;
  type?: string;
  code?: string;
  details?: unknown;
}

// Standard API Response
export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// File Upload
export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  mimeType?: string;
}

// Image URL normalization result
export type ImageUrl = string | null;

// Loading State
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Form State
export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isDirty: boolean;
  isValid: boolean;
}

// User with token
export interface UserWithToken {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  token: string;
  avatar?: string;
  coverPhoto?: string;
  [key: string]: unknown;
}
