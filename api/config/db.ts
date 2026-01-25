import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    mongoose.connection.on('connected', () => {
      console.log(`[MongoDB] Connected successfully to host: ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection lost');
    });

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const handleShutdown = async () => {
      try {
        await mongoose.connection.close();
        console.log('[MongoDB] Connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('[MongoDB] Error closing connection:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);

  } catch (error) {
    if (error instanceof Error) {
      console.error(`[MongoDB] Critical Error: ${error.message}`);
    }
    process.exit(1);
  }
};

export default connectDB;