/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Import Routes
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import interviewRoutes from './routes/interview.js';
import postRoutes from './routes/posts.js';
import articleRoutes from './routes/articles.js';
import jobRoutes from './routes/jobs.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env
dotenv.config();

// Connect to Database
connectDB();

const app: express.Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Cấu hình thêm origin nếu cần thiết cho production
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (nếu có upload ảnh)
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

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

/**
 * Health Check
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date()
    });
  },
);

/**
 * 404 handler (API Not Found)
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Not Found - ${req.originalUrl}`,
  });
});

/**
 * Global Error Handler Middleware
 */
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  // Log lỗi ra console để debug
  console.error(`[Error] ${req.method} ${req.path}:`, error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server internal error';

  res.status(statusCode).json({
    success: false,
    error: message,
    // Chỉ hiện stack trace khi ở môi trường development
    stack: process.env.NODE_ENV === 'production' ? null : error.stack,
  });
});


if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
}

export default app;