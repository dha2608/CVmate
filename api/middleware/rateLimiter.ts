import rateLimit from 'express-rate-limit';

// Rate limiter cho free users: 10 requests per day
export const freeUserLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // 10 requests per day
  message: {
    success: false,
    error: 'Rate limit exceeded. You have reached the daily limit of 10 requests. Please upgrade to premium for unlimited access.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho auth endpoints: 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: 'Too many login attempts. Please try again later.',
  },
});

// Rate limiter cho AI endpoints: 20 requests per hour
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    error: 'AI service rate limit exceeded. Please try again later.',
  },
});
