/**
 * Unified Error Handler for Backend
 * Provides consistent error handling and response formatting
 */

import { Response } from 'express';
import logger from './logger.js';

export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // Server errors
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface StandardErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

export interface StandardSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export type StandardApiResponse<T = unknown> = StandardSuccessResponse<T> | StandardErrorResponse;

/**
 * Send standardized error response
 */
export const sendErrorResponse = (
  res: Response,
  code: ErrorCode,
  message: string,
  statusCode: number = 400,
  details?: unknown
): void => {
  const response: StandardErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  // Log error in development or for server errors
  if (process.env.NODE_ENV !== 'production' || statusCode >= 500) {
    logger.error(`API Error [${code}]: ${message}`, undefined, { statusCode, details });
  }

  res.status(statusCode).json(response);
};

/**
 * Send standardized success response
 */
export const sendSuccessResponse = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string
): void => {
  const response: StandardSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };

  res.status(statusCode).json(response);
};

/**
 * Map HTTP status code to ErrorCode
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
 * Handle validation errors
 */
export const handleValidationError = (
  res: Response,
  message: string = 'Validation failed',
  details?: unknown
): void => {
  sendErrorResponse(res, ErrorCode.VALIDATION_ERROR, message, 400, details);
};

/**
 * Handle not found errors
 */
export const handleNotFoundError = (
  res: Response,
  resource: string = 'Resource'
): void => {
  sendErrorResponse(res, ErrorCode.NOT_FOUND, `${resource} not found`, 404);
};

/**
 * Handle unauthorized errors
 */
export const handleUnauthorizedError = (
  res: Response,
  message: string = 'Unauthorized'
): void => {
  sendErrorResponse(res, ErrorCode.UNAUTHORIZED, message, 401);
};

/**
 * Handle forbidden errors
 */
export const handleForbiddenError = (
  res: Response,
  message: string = 'Forbidden'
): void => {
  sendErrorResponse(res, ErrorCode.FORBIDDEN, message, 403);
};

/**
 * Handle server errors
 */
export const handleServerError = (
  res: Response,
  error: Error | unknown,
  message: string = 'Internal server error'
): void => {
  const errorDetails = error instanceof Error ? error.message : String(error);
  
  logger.error('Server Error', error instanceof Error ? error : new Error(String(error)));
  
  sendErrorResponse(
    res,
    ErrorCode.SERVER_ERROR,
    message,
    500,
    process.env.NODE_ENV === 'production' ? undefined : errorDetails
  );
};

/**
 * Handle database errors
 */
export const handleDatabaseError = (
  res: Response,
  error: Error | unknown
): void => {
  logger.error('Database Error', error instanceof Error ? error : new Error(String(error)));
  
  sendErrorResponse(
    res,
    ErrorCode.DATABASE_ERROR,
    'Database operation failed',
    500,
    process.env.NODE_ENV === 'production' ? undefined : error instanceof Error ? error.message : String(error)
  );
};

/**
 * Handle external API errors
 */
export const handleExternalApiError = (
  res: Response,
  service: string,
  error: Error | unknown
): void => {
  logger.error(`External API Error (${service})`, error instanceof Error ? error : new Error(String(error)));
  
  sendErrorResponse(
    res,
    ErrorCode.EXTERNAL_API_ERROR,
    `External service (${service}) error`,
    502,
    process.env.NODE_ENV === 'production' ? undefined : error instanceof Error ? error.message : String(error)
  );
};
