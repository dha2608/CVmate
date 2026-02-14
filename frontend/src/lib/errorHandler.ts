/**
 * Unified Error Handler
 * Provides consistent error handling across the application
 * 
 * This module replaces the old errorHandler.ts in utils/ with a more comprehensive solution
 */

import type { ApiError, ApiResponse } from '@/types/api';

export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // Server errors
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface StandardError {
  code: ErrorCode;
  message: string;
  details?: unknown;
  statusCode?: number;
}

/**
 * Convert HTTP status code to ErrorCode
 */
export const statusToErrorCode = (status: number): ErrorCode => {
  switch (status) {
    case 400:
      return ErrorCode.VALIDATION_ERROR;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 409:
      return ErrorCode.ALREADY_EXISTS;
    case 429:
      return ErrorCode.RATE_LIMIT_EXCEEDED;
    case 500:
    case 502:
    case 503:
      return ErrorCode.SERVER_ERROR;
    default:
      return ErrorCode.UNKNOWN_ERROR;
  }
};

/**
 * Extract error message from API response
 */
export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    if (apiError.message) {
      return apiError.message;
    }
    
    if (apiError.details?.message) {
      return apiError.details.message;
    }
    
    const response = error as ApiResponse<unknown>;
    if (response.error) {
      return response.error;
    }
    
    if (response.message) {
      return response.message;
    }
  }
  
  return 'An unexpected error occurred';
};

/**
 * Extract error code from error object
 */
export const extractErrorCode = (error: unknown): ErrorCode => {
  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    
    if (apiError.code) {
      return apiError.code as ErrorCode;
    }
    
    if (apiError.status) {
      return statusToErrorCode(apiError.status);
    }
    
    const response = error as ApiResponse<unknown>;
    if (response.code) {
      return response.code as ErrorCode;
    }
  }
  
  return ErrorCode.UNKNOWN_ERROR;
};

/**
 * Create a standardized error object
 */
export const createStandardError = (
  code: ErrorCode,
  message: string,
  details?: unknown,
  statusCode?: number
): StandardError => {
  return {
    code,
    message,
    details,
    statusCode,
  };
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.name === 'NetworkError' ||
      error.name === 'AbortError' ||
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    );
  }
  return false;
};

/**
 * Check if error is a timeout error
 */
export const isTimeoutError = (error: unknown): boolean => {
  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    return apiError.type === 'timeout' || apiError.status === 408;
  }
  return false;
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  const code = extractErrorCode(error);
  const message = extractErrorMessage(error);
  
  // Provide user-friendly messages for common errors
  switch (code) {
    case ErrorCode.NETWORK_ERROR:
      return 'Network connection failed. Please check your internet connection and try again.';
    case ErrorCode.TIMEOUT:
      return 'Request timed out. Please try again.';
    case ErrorCode.RATE_LIMIT_EXCEEDED:
      return 'Too many requests. Please wait a moment and try again.';
    case ErrorCode.UNAUTHORIZED:
      return 'Please log in to continue.';
    case ErrorCode.FORBIDDEN:
      return 'You do not have permission to perform this action.';
    case ErrorCode.NOT_FOUND:
      return 'The requested resource was not found.';
    case ErrorCode.VALIDATION_ERROR:
      return message || 'Please check your input and try again.';
    case ErrorCode.SERVER_ERROR:
      return 'Server error occurred. Please try again later.';
    default:
      return message || 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Format error for logging
 */
export const formatErrorForLogging = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return JSON.stringify(error, null, 2);
};
