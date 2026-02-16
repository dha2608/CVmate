import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import passport from './config/passport.js';
import logger from './utils/logger.js';
import { requestLogger } from './middleware/requestLogger.js';
import { sanitizeRequest } from './middleware/sanitize.js';
import { csrfProtection } from './middleware/csrf.js';
import { sendErrorResponse, handleServerError, ErrorCode } from './utils/errorHandler.js';

// Import Routes
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import interviewRoutes from './routes/interview.js';
import postRoutes from './routes/posts.js';
import articleRoutes from './routes/articles.js';
import jobRoutes from './routes/jobs.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';
import speechRoutes from './routes/speech.js';
import newsRoutes from './routes/news.js';
import uploadRoutes from './routes/upload.js';
import paymentRoutes from './routes/payment.js';
import chatRoutes from './routes/chat.js';
import twoFactorRoutes from './routes/twofactor.js';
import templateRoutes from './routes/templates.js';
import pushRoutes from './routes/push.js';
import achievementRoutes from './routes/achievements.js';
import adminRoutes from './routes/admin.js';
import analyticsRoutes from './routes/analytics.js';

// Load env
dotenv.config();

// Connect to Database
connectDB();

const app: express.Application = express();

// Hide tech stack header
app.disable('x-powered-by');

// Security Headers - Disable CSP for images to allow cross-origin, but keep strong defaults
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:", "*"], // Allow all images
      connectSrc: ["'self'", "https:", "http:"],
      fontSrc: ["'self'", "data:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for PDF generation
  crossOriginResourcePolicy: false, // Disable CORP to allow cross-origin images
  referrerPolicy: {
    policy: 'same-origin',
  },
  frameguard: {
    action: 'deny',
  },
  hsts: process.env.NODE_ENV === 'production'
    ? {
        maxAge: 15552000, // 180 days
        includeSubDomains: true,
        preload: false,
      }
    : false,
}));

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow Vercel preview URLs (c-vmate-*.vercel.app)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.some(allowed => origin === allowed || origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      // For development, allow localhost
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
app.use(requestLogger);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || process.env.SESSION_SECRET || 'cvmate-cookie-secret'));
app.use(sanitizeRequest);

// Request timeout middleware
import { requestTimeout } from './middleware/timeout.js';
app.use(requestTimeout(30000)); // 30 seconds

// Session for OAuth (only if Google OAuth is configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'cvmate-secret-key',
    resave: false,
    saveUninitialized: false,
    store: mongoUri ? MongoStore.create({
      mongoUrl: mongoUri,
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: 'native',
    }) : undefined, // Fallback to MemoryStore if no MongoDB URI
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Must be true in production for HTTPS
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' required for cross-origin in production
    },
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
}

// Handle favicon requests early (before CSRF)
app.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204).end();
});

// Expose CSRF token for frontend to fetch and cache
// MUST be before CSRF middleware to avoid circular dependency
// This endpoint doesn't need CSRF verification - it's used to GET the token
app.get('/api/csrf-token', (req: Request, res: Response, next: NextFunction) => {
  // Use csrfProtection to generate token (it will create cookie automatically)
  // For GET requests, csurf doesn't verify, it just generates the token
  csrfProtection(req, res, (err: unknown) => {
    if (err) {
      // If there's an error, try to generate token anyway
      logger.warn('CSRF token generation error (non-critical):', err);
    }
    
    // Get the token (csurf adds csrfToken() method to request)
    const token = (req as any).csrfToken ? (req as any).csrfToken() : '';
    
    if (!token) {
      logger.error('Failed to generate CSRF token');
      return res.status(500).json({
        success: false,
        message: 'Failed to generate CSRF token',
      });
    }
    
    res.json({
      success: true,
      csrfToken: token,
    });
  });
});

// CSRF protection: enable after sessions/cookies are configured, before API routes
// Note: frontend must read token from `/api/csrf-token` and send it back in `x-csrf-token` header for mutating requests.
// Skip CSRF for static assets and GET requests (except mutating GET endpoints)
app.use((req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for static assets
  if (req.path.startsWith('/assets/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  // Skip CSRF for GET requests (except specific mutating endpoints)
  // GET requests are generally safe and don't need CSRF protection
  if (req.method === 'GET' && req.path !== '/api/csrf-token') {
    return next();
  }
  return csrfProtection(req, res, next);
});

// Serve uploaded files statically with CORS headers
// IMPORTANT: This must be BEFORE API routes to handle static file requests
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', (req, res, next) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  // Set CORS headers for static files - allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  // Explicitly remove CORP header that blocks cross-origin
  res.removeHeader('Cross-Origin-Resource-Policy');
  res.removeHeader('Cross-Origin-Embedder-Policy');
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    // Ensure CORS headers are set
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    // Don't set CORP - it blocks cross-origin
  }
}));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

/**
 * Root Endpoint
 * Returns API information and available endpoints
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'CVmate API Server',
    version: '1.0.0',
    documentation: {
      health: '/api/health',
      endpoints: {
        auth: {
          base: '/api/auth',
          routes: [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/auth/google',
            'GET /api/auth/google/callback',
            'POST /api/auth/onboarding',
            'GET /api/auth/me',
            'PUT /api/auth/me',
            'GET /api/auth/users/:id/public',
          ],
        },
        resumes: {
          base: '/api/resumes',
          routes: [
            'GET /api/resumes',
            'POST /api/resumes',
            'GET /api/resumes/:id',
            'PUT /api/resumes/:id',
            'DELETE /api/resumes/:id',
            'POST /api/resumes/ai-enhance',
            'POST /api/resumes/:id/analyze',
            'POST /api/resumes/ai-generate-full',
          ],
        },
        interviews: {
          base: '/api/interviews',
          routes: [
            'POST /api/interviews/start',
            'GET /api/interviews',
            'GET /api/interviews/:id',
            'POST /api/interviews/:id/chat',
            'POST /api/interviews/:id/end',
          ],
        },
        posts: {
          base: '/api/posts',
          routes: [
            'GET /api/posts',
            'POST /api/posts',
            'PUT /api/posts/:id/like',
            'POST /api/posts/:id/comment',
          ],
        },
        articles: {
          base: '/api/articles',
          routes: [
            'GET /api/articles',
            'POST /api/articles',
            'GET /api/articles/:id',
          ],
        },
        jobs: {
          base: '/api/jobs',
          routes: [
            'GET /api/jobs',
            'GET /api/jobs/:id',
            'POST /api/jobs',
            'POST /api/jobs/:id/apply',
          ],
        },
        messages: {
          base: '/api/messages',
          routes: [
            'GET /api/messages/conversations',
            'GET /api/messages/:userId',
            'POST /api/messages',
          ],
        },
        notifications: {
          base: '/api/notifications',
          routes: [
            'GET /api/notifications',
            'PUT /api/notifications/:id/read',
            'PUT /api/notifications/read-all',
            'DELETE /api/notifications/:id',
          ],
        },
        dashboard: {
          base: '/api/dashboard',
          routes: [
            'GET /api/dashboard/stats',
          ],
        },
        speech: {
          base: '/api/speech',
          routes: [
            'POST /api/speech/transcribe',
            'GET /api/speech/instructions',
          ],
        },
        news: {
          base: '/api/news',
          routes: [
            'GET /api/news',
            'POST /api/news/refresh',
          ],
        },
        upload: {
          base: '/api/upload',
          routes: [
            'POST /api/upload/avatar',
            'POST /api/upload/cover-photo',
            'GET /api/upload/file/:filename',
          ],
        },
        payment: {
          base: '/api/payment',
          routes: [
            'POST /api/payment/webhook',
            'POST /api/payment/create-checkout-session',
            'GET /api/payment/subscription-status',
            'POST /api/payment/cancel-subscription',
            'POST /api/payment/paypal/create-order',
            'POST /api/payment/paypal/capture',
          ],
        },
      },
    },
    status: 'running',
    timestamp: new Date().toISOString(),
    totalEndpoints: 50,
  });
});

/**
 * Health Check Endpoint
 * Returns server status, database connection, and system information
 */
app.get('/api/health', async (req: Request, res: Response) => {
  const checks: Record<string, { status: string; message?: string }> = {};
  let allHealthy = true;

  // Check database connection
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      checks.database = { status: 'ok' };
    } else {
      checks.database = { status: 'error', message: 'Not connected' };
      allHealthy = false;
    }
  } catch (error) {
    checks.database = { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
    allHealthy = false;
    logger.warn('Health check: Database connection failed', { error });
  }

  // Check AI service (if configured)
  if (process.env.HF_API_KEY) {
    checks.aiService = { status: 'ok', message: 'Configured' };
  } else {
    checks.aiService = { status: 'warning', message: 'Not configured' };
  }

  // Check storage (uploads directory)
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (fs.existsSync(uploadsDir)) {
      checks.storage = { status: 'ok' };
    } else {
      checks.storage = { status: 'warning', message: 'Uploads directory not found' };
    }
  } catch (error) {
    checks.storage = { status: 'error', message: 'Cannot check storage' };
  }

  const health = {
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    checks,
  };

  const statusCode = allHealthy ? 200 : 503;
  res.status(statusCode).json({
    success: allHealthy,
    ...health,
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  sendErrorResponse(res, ErrorCode.NOT_FOUND, `Not Found - ${req.originalUrl}`, 404);
});

/**
 * Error Handler
 */
app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  // Log error
  logger.error(`Error ${req.method} ${req.path}`, error instanceof Error ? error : new Error(String(error)), {
    method: req.method,
    path: req.path,
  });
  
  // Handle AppError instances (if any custom error class exists)
  if (error instanceof Error && 'statusCode' in error && (error as { isOperational?: boolean }).isOperational) {
    const appError = error as { statusCode: number; message: string; code?: string; details?: unknown };
    const isDev = process.env.NODE_ENV !== 'production';
    return sendErrorResponse(
      res,
      (appError.code as ErrorCode) || ErrorCode.UNKNOWN_ERROR,
      appError.message || 'An error occurred',
      appError.statusCode,
      isDev ? appError.details : undefined
    );
  }
  
  // Handle unknown errors
  handleServerError(res, error, 'Internal server error');
});

export default app;