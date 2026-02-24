import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import User from '../models/User.js';
import { AuthRequest } from './authMiddleware.js';

const skipPremium = async (req: AuthRequest) => {
  if (!req.user) {
    return false;
  }
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return false;
    }
    const subscription = user.subscription || { plan: 'free', status: 'active' };
    if (subscription.plan === 'premium' && subscription.status === 'active') {
      if (subscription.endDate && new Date() > subscription.endDate) {
        return false;
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Generate a stable key for rate limiting:
 * - If user is authenticated, use user id
 * - Otherwise, fall back to IP address
 */
const userOrIpKeyGenerator = (req: AuthRequest): string => {
  if (req.user?._id) {
    return String(req.user._id);
  }

  // Use express-rate-limit's helper to properly normalize IPv6 addresses
  // and avoid ERR_ERL_KEY_GEN_IPV6.
  return ipKeyGenerator(req);
};

export const freeUserLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: parseInt(process.env.FREE_USER_DAILY_LIMIT || (process.env.NODE_ENV === 'production' ? '10' : '100')),
  message: {
    success: false,
    error: 'Rate limit exceeded. You have reached the daily limit. Please upgrade to premium for unlimited access.',
    message: 'Rate limit exceeded. You have reached the daily limit. Please upgrade to premium for unlimited access.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKeyGenerator,
  skip: async (req) => {
    return await skipPremium(req as AuthRequest);
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. You have reached the daily limit. Please upgrade to premium for unlimited access.',
      message: 'Rate limit exceeded. You have reached the daily limit. Please upgrade to premium for unlimited access.',
      type: 'server_rate_limit',
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT || '5'),
  message: {
    success: false,
    error: 'Too many login attempts. Please try again later.',
  },
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.AI_RATE_LIMIT || (process.env.NODE_ENV === 'production' ? '20' : '100')),
  message: {
    success: false,
    error: 'AI service rate limit exceeded. Please try again later.',
    message: 'AI service rate limit exceeded. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKeyGenerator,
  skip: async (req) => {
    return await skipPremium(req as AuthRequest);
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'AI service rate limit exceeded. Please try again later.',
      message: 'AI service rate limit exceeded. Please try again later.',
      type: 'server_rate_limit',
    });
  },
});
