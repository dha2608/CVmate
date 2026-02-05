import { HfInference } from '@huggingface/inference';
import type { AuthRequest } from '../middleware/authMiddleware.js';
import logger from './logger.js';

type AIClientType = 'chat' | 'resume_enhance' | 'resume_analyze' | 'resume_generate' | 'article_seo' | 'interview_chat' | 'interview_feedback' | 'speech_to_text' | 'job_recommendation';

type AIModelKind = 'chat' | 'stt' | 'generic';

interface AIUsageMeta {
  userId?: string;
  endpoint: string;
  type: AIClientType;
  model: string;
  durationMs: number;
  success: boolean;
  errorCode?: string | number;
}

const getHFClient = () => {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new HfInference(apiKey);
};

export const getHFOrThrow = () => {
  const client = getHFClient();
  if (!client) {
    throw new Error('HF_API_KEY is not configured');
  }
  return client;
};

const resolveBaseModel = (kind: AIModelKind): string => {
  if (kind === 'chat') {
    return process.env.HF_CHAT_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct';
  }
  if (kind === 'stt') {
    return process.env.HF_STT_MODEL || 'openai/whisper-small';
  }
  return process.env.HF_GENERIC_MODEL || process.env.HF_CHAT_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct';
};

/**
 * Resolve effective model name from:
 * 1. Per-request override (query/body)
 * 2. Environment defaults by kind
 */
export const resolveModel = (req: AuthRequest | null, kind: AIModelKind): string => {
  const override =
    (req?.query?.model as string | undefined) ||
    ((req?.body as any)?.model as string | undefined);

  if (override && typeof override === 'string' && override.trim().length > 0) {
    return override.trim();
  }

  return resolveBaseModel(kind);
};

// Simple in-memory cache for deterministic AI responses
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const aiCache = new Map<string, CacheEntry<unknown>>();

export const buildCacheKey = (type: AIClientType, model: string, payload: unknown): string => {
  const payloadString = JSON.stringify(payload);
  return `${type}:${model}:${payloadString}`;
};

export const getCachedOrRun = async <T>(
  cacheKey: string,
  ttlMs: number,
  runner: () => Promise<T>
): Promise<T> => {
  const now = Date.now();
  const existing = aiCache.get(cacheKey) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  const result = await runner();
  aiCache.set(cacheKey, { value: result, expiresAt: now + ttlMs });
  return result;
};

export const logAIUsage = (meta: AIUsageMeta) => {
  logger.info('AI_USAGE', meta);
};

