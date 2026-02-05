import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import passport from './config/passport.js';
import logger from './utils/logger.js';

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

// Load env
dotenv.config();

// Connect to Database
connectDB();

const app: express.Application = express();

// Security Headers
const renderUrl = process.env.RENDER_URL || 'https://cvmate-kf5p.onrender.com';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:", 
        "http:",
        renderUrl, // Allow images from Render
        "*.onrender.com", // Allow all Render subdomains
        "*.vercel.app", // Allow Vercel previews
      ],
      connectSrc: [
        "'self'", 
        "https:",
        renderUrl,
        "*.onrender.com",
        "*.vercel.app",
      ],
      fontSrc: ["'self'", "data:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for PDF generation
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded cross-origin
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      sameSite: 'lax',
    },
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
}

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

// Serve uploaded files statically with CORS headers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for static files
  const origin = req.headers.origin;
  if (origin && (origin.includes('.vercel.app') || origin.includes('localhost'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    // Allow images to be loaded cross-origin
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

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
        auth: '/api/auth',
        resumes: '/api/resumes',
        interviews: '/api/interviews',
        posts: '/api/posts',
        articles: '/api/articles',
        jobs: '/api/jobs',
        messages: '/api/messages',
        notifications: '/api/notifications',
        dashboard: '/api/dashboard',
        speech: '/api/speech',
        news: '/api/news',
        upload: '/api/upload',
        payment: '/api/payment',
      },
    },
    status: 'running',
    timestamp: new Date().toISOString(),
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
  res.status(404).json({ success: false, error: `Not Found - ${req.originalUrl}` });
});

/**
 * Error Handler
 */
app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  // Log error
  logger.error(`Error ${req.method} ${req.path}`, error instanceof Error ? error : new Error(String(error)), {
    method: req.method,
    path: req.path,
    statusCode: (error as any).statusCode || 500,
    code: (error as any).code,
  });
  
  // Handle AppError instances
  if (error instanceof Error && 'statusCode' in error && (error as any).isOperational) {
    const appError = error as any;
    return res.status(appError.statusCode).json({
      success: false,
      error: appError.message || 'An error occurred',
      code: appError.code,
      ...(isDev && appError.details && { details: appError.details }),
    });
  }
  
  // Handle unknown errors
  const statusCode = (error as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: isDev 
      ? ((error as any).message || 'Server internal error')
      : 'Server internal error',
    ...(isDev && { stack: (error as any).stack }),
  });
});

export default app;