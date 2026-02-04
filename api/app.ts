import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import session from 'express-session';
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

// Session for OAuth (only if Google OAuth is configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'cvmate-secret-key',
    resave: false,
    saveUninitialized: false,
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

// Serve uploaded files statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/**
 * Health Check Endpoint
 * Returns server status, database connection, and system information
 */
app.get('/api/health', async (req: Request, res: Response) => {
  const health: {
    status: string;
    timestamp: string;
    uptime: number;
    database: string;
    memory: NodeJS.MemoryUsage;
    environment: string;
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'unknown',
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
  };

  try {
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      health.database = 'connected';
    } else {
      health.database = 'disconnected';
      health.status = 'degraded';
    }
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'degraded';
    logger.warn('Health check: Database connection failed', { error });
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json({
    success: health.status === 'ok',
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
  logger.error(`Error ${req.method} ${req.path}`, error instanceof Error ? error : new Error(String(error)), {
    method: req.method,
    path: req.path,
    statusCode: (error as any).statusCode || 500,
  });
  const statusCode = (error as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: (error as any).message || 'Server internal error',
    stack: process.env.NODE_ENV === 'production' ? null : (error as any).stack,
  });
});

export default app;