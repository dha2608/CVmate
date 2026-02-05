import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import logger from '../utils/logger.js';

dotenv.config();

type MigrationFn = () => Promise<void>;

interface Migration {
  id: string;
  description: string;
  up: MigrationFn;
}

// 示例迁移：确保必要索引已创建（可根据需要扩展）
const migrations: Migration[] = [
  {
    id: '001-ensure-indexes',
    description: 'Ensure critical indexes exist on core collections',
    up: async () => {
      const { default: Job } = await import('../models/Job.js');
      const { default: Post } = await import('../models/Post.js');
      const { default: Message } = await import('../models/Message.js');
      const { default: Notification } = await import('../models/Notification.js');
      const { default: Article } = await import('../models/Article.js');

      await Promise.all([
        Job.syncIndexes(),
        Post.syncIndexes(),
        Message.syncIndexes(),
        Notification.syncIndexes(),
        Article.syncIndexes(),
      ]);

      logger.info('Indexes synced for Job, Post, Message, Notification, Article');
    },
  },
];

const MIGRATIONS_COLLECTION = '_migrations';

const runMigrations = async () => {
  try {
    await connectDB();

    const migrationModel = mongoose.connection.collection(MIGRATIONS_COLLECTION);
    const appliedDocs = await migrationModel.find({}).toArray();
    const appliedIds = new Set(appliedDocs.map((m) => m.id as string));

    for (const migration of migrations) {
      if (appliedIds.has(migration.id)) {
        logger.info(`Skipping already applied migration: ${migration.id}`);
        continue;
      }

      logger.info(`Running migration: ${migration.id} - ${migration.description}`);
      await migration.up();
      await migrationModel.insertOne({
        id: migration.id,
        description: migration.description,
        appliedAt: new Date(),
      });
      logger.info(`Migration applied: ${migration.id}`);
    }

    await mongoose.connection.close();
    logger.info('All migrations finished');
    process.exit(0);
  } catch (error) {
    logger.error('Migration runner failed', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

runMigrations();

