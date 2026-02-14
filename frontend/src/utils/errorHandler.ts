/**
 * Error handling utilities
 * Provides type-safe error handling functions
 */

import type { ApiError, ValidationError } from '@/types/api';

/**
 * Type guard to check if error is an ApiError
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('status' in error || 'details' in error || 'type' in error)
  );
};

/**
 * Type guard to check if error is a ValidationError
 */
export const isValidationError = (error: unknown): error is ValidationError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ValidationError).message === 'string'
  );
};

/**
 * Extract error message from unknown error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (isApiError(error)) {
    return error.message || error.details?.message || 'An error occurred';
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

/**
 * Extract validation errors from API error
 */
export const getValidationErrors = (error: unknown): string[] => {
  const errors: string[] = [];
  
  if (isApiError(error) && error.details?.errors) {
    error.details.errors.forEach((err) => {
      if (typeof err === 'string') {
        errors.push(err);
      } else if (err && typeof err === 'object') {
        if ('message' in err && typeof err.message === 'string') {
          const path = 'path' in err ? err.path : undefined;
          const pathStr = path 
            ? (Array.isArray(path) ? path.join('.') : path)
            : '';
          errors.push(pathStr ? `${pathStr}: ${err.message}` : err.message);
        }
      }
    });
  }
  
  return errors;
};

/**
 * Get error status code
 */
export const getErrorStatus = (error: unknown): number | undefined => {
  if (isApiError(error) && error.status) {
    return error.status;
  }
  return undefined;
};
