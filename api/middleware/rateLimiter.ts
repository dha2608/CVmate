import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { AuthRequest } from './authMiddleware.js';

const skipPremium = async (req: AuthRequest) => {
  if (!req.user) return false;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return false;
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

export const freeUserLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: parseInt(process.env.FREE_USER_DAILY_LIMIT || '10'),
  message: {
    success: false,
    error: 'Rate limit exceeded. You have reached the daily limit of 10 requests. Please upgrade to premium for unlimited access.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: async (req) => {
    return await skipPremium(req as AuthRequest);
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
  windowMs: 60 * 60 * 1000,
  max: parseInt(process.env.AI_RATE_LIMIT || '20'),
  message: {
    success: false,
    error: 'AI service rate limit exceeded. Please try again later.',
  },
  skip: async (req) => {
    return await skipPremium(req as AuthRequest);
  },
});
