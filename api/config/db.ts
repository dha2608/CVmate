import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI or MONGODB_URI is not defined in environment variables');
    }

    mongoose.connection.on('connected', () => {
      logger.info(`MongoDB connected successfully to host: ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost');
    });

    logger.info('Connecting to MongoDB...');

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '20', 10),
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5', 10),
      maxIdleTimeMS: 30000,
    });

    const handleShutdown = async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
      } catch (err) {
        logger.error('MongoDB error closing connection', err);
      } finally {
        process.exit(0);
      }
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);

  } catch (error) {
    if (error instanceof Error) {
      logger.error(`MongoDB critical error: ${error.message}`, error);
    } else {
      logger.error('MongoDB critical error', new Error(String(error)));
    }
    // Don't hard-exit in managed environments (Render) where logs may be truncated.
    // Let the process crash naturally if it must, but prefer keeping the server alive
    // so /api/health can report degraded status.
    throw error;
  }
};

export default connectDB;