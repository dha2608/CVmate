import { Response } from 'express';
import logger from './logger.js';

export interface AIErrorContext {
  userId?: string;
  endpoint: string;
  type: string;
  model: string;
  durationMs: number;
}

export interface ParsedAIError {
  message: string;
  statusCode: number;
  isRetryable: boolean;
}

export const parseAIError = (error: unknown): ParsedAIError => {
  const errorObj = error as { status?: number; statusCode?: number; message?: string };
  const errorMsg = errorObj.message || '';
  const errorMsgLower = errorMsg.toLowerCase();

  if (errorObj.status === 401 || errorObj.statusCode === 401 || errorMsgLower.includes('api key')) {
    return {
      message: 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.',
      statusCode: 503,
      isRetryable: false,
    };
  }

  if (
    errorObj.status === 429 ||
    errorObj.statusCode === 429 ||
    errorMsgLower.includes('rate limit')
  ) {
    return {
      message: 'AI API rate limit exceeded. Please try again later.',
      statusCode: 429,
      isRetryable: true,
    };
  }

  if (
    errorObj.status === 402 ||
    errorObj.statusCode === 402 ||
    errorMsgLower.includes('quota') ||
    errorMsgLower.includes('billing')
  ) {
    return {
      message: 'AI API quota exceeded. Please check your provider account limits.',
      statusCode: 402,
      isRetryable: true,
    };
  }

  if (errorMsgLower.includes('service unavailable') || errorMsgLower.includes('503')) {
    return {
      message: 'AI service temporarily unavailable. Please try again later.',
      statusCode: 503,
      isRetryable: true,
    };
  }

  return {
    message: errorMsg || 'AI service is currently unavailable.',
    statusCode: 503,
    isRetryable: true,
  };
};

export const handleAIError = (
  res: Response,
  error: unknown,
  context: AIErrorContext,
  customMessage?: string
) => {
  const parsed = parseAIError(error);
  const errorMessage = customMessage || parsed.message;

  logger.error(
    `AI Error at ${context.endpoint}`,
    error instanceof Error ? error : new Error(String(error)),
    {
      userId: context.userId,
      type: context.type,
      model: context.model,
    }
  );

  logger.info('AI_USAGE', {
    userId: context.userId,
    endpoint: context.endpoint,
    type: context.type,
    model: context.model,
    durationMs: context.durationMs,
    success: false,
    errorCode: (error as any)?.status || (error as any)?.statusCode || 'UNKNOWN',
  });

  const response: {
    success: boolean;
    message: string;
    error: string;
    retryable?: boolean;
  } = {
    success: false,
    message: errorMessage,
    error: error instanceof Error ? error.message : 'AI API error',
  };

  if (parsed.statusCode === 503 || parsed.statusCode === 429) {
    response.retryable = parsed.isRetryable;
  }

  res.status(parsed.statusCode).json(response);
};
