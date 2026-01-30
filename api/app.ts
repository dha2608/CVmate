import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import session from 'express-session';
import connectDB from './config/db.js';
import passport from './config/passport.js';

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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
 * Health Check
 */
app.use('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
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
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error] ${req.method} ${req.path}:`, error);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Server internal error',
    stack: process.env.NODE_ENV === 'production' ? null : error.stack,
  });
});

export default app;