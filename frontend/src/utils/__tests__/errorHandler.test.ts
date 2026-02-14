/**
 * Error Handler Tests
 */

import { describe, it, expect } from 'vitest';
import {
  isApiError,
  isValidationError,
  getErrorMessage,
  getValidationErrors,
  getErrorStatus,
} from '../errorHandler';
import type { ApiError, ValidationError } from '@/types/api';

describe('errorHandler', () => {
  describe('isApiError', () => {
    it('should return true for ApiError objects', () => {
      const error: ApiError = {
        name: 'ApiError',
        message: 'Test error',
        status: 400,
        type: 'validation',
      };
      expect(isApiError(error)).toBe(true);
    });

    it('should return false for regular Error objects', () => {
      const error = new Error('Test error');
      expect(isApiError(error)).toBe(false);
    });

    it('should return false for strings', () => {
      expect(isApiError('test')).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('should return true for ValidationError objects', () => {
      const error: ValidationError = {
        message: 'Validation failed',
        path: 'email',
      };
      expect(isValidationError(error)).toBe(true);
    });

    it('should return false for regular Error objects', () => {
      const error = new Error('Test error');
      expect(isValidationError(error)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    it('should extract message from ApiError', () => {
      const error: ApiError = {
        name: 'ApiError',
        message: 'API error',
        details: { message: 'Detailed error' },
      };
      expect(getErrorMessage(error)).toBe('API error');
    });

    it('should return string for string errors', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should return default message for unknown errors', () => {
      expect(getErrorMessage({})).toBe('An unexpected error occurred');
    });
  });

  describe('getValidationErrors', () => {
    it('should extract validation errors from ApiError', () => {
      const error: ApiError = {
        name: 'ApiError',
        message: 'Validation failed',
        details: {
          errors: ['Error 1', 'Error 2'],
        },
      };
      const errors = getValidationErrors(error);
      expect(errors).toEqual(['Error 1', 'Error 2']);
    });

    it('should handle object validation errors', () => {
      const error: ApiError = {
        name: 'ApiError',
        message: 'Validation failed',
        details: {
          errors: [
            { message: 'Email is required', path: 'email' },
            { message: 'Name is required', path: 'name' },
          ],
        },
      };
      const errors = getValidationErrors(error);
      expect(errors).toContain('email: Email is required');
      expect(errors).toContain('name: Name is required');
    });

    it('should return empty array for non-ApiError', () => {
      const error = new Error('Test error');
      expect(getValidationErrors(error)).toEqual([]);
    });
  });

  describe('getErrorStatus', () => {
    it('should return status from ApiError', () => {
      const error: ApiError = {
        name: 'ApiError',
        message: 'Test error',
        status: 404,
      };
      expect(getErrorStatus(error)).toBe(404);
    });

    it('should return undefined for non-ApiError', () => {
      const error = new Error('Test error');
      expect(getErrorStatus(error)).toBeUndefined();
    });
  });
});
