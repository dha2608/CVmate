import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Notification from '../models/Notification.js';
import Message from '../models/Message.js';
import Archive from '../models/Archive.js';
import logger from '../utils/logger.js';

dotenv.config();

const DAYS_TO_KEEP_NOTIFICATIONS = parseInt(process.env.ARCHIVE_NOTIFICATIONS_DAYS || '90', 10);
const DAYS_TO_KEEP_MESSAGES = parseInt(process.env.ARCHIVE_MESSAGES_DAYS || '180', 10);

const archiveOldData = async () => {
  try {
    await connectDB();

    const now = new Date();

    // Archive old read notifications
    const notifCutoff = new Date(now.getTime() - DAYS_TO_KEEP_NOTIFICATIONS * 24 * 60 * 60 * 1000);
    const oldNotifications = await Notification.find({
      read: true,
      createdAt: { $lt: notifCutoff },
    }).lean();

    if (oldNotifications.length > 0) {
      const notifArchives = oldNotifications.map((doc) => ({
        collection: 'notifications',
        originalId: doc._id as mongoose.Types.ObjectId,
        data: doc,
        reason: `Auto-archive read notifications older than ${DAYS_TO_KEEP_NOTIFICATIONS} days`,
      }));
      await Archive.insertMany(notifArchives);
      const ids = oldNotifications.map((d) => d._id);
      await Notification.deleteMany({ _id: { $in: ids } });
      logger.info(`Archived ${oldNotifications.length} notifications`);
    }

    // Archive old messages
    const msgCutoff = new Date(now.getTime() - DAYS_TO_KEEP_MESSAGES * 24 * 60 * 60 * 1000);
    const oldMessages = await Message.find({
      createdAt: { $lt: msgCutoff },
    }).lean();

    if (oldMessages.length > 0) {
      const msgArchives = oldMessages.map((doc) => ({
        collection: 'messages',
        originalId: doc._id as mongoose.Types.ObjectId,
        data: doc,
        reason: `Auto-archive messages older than ${DAYS_TO_KEEP_MESSAGES} days`,
      }));
      await Archive.insertMany(msgArchives);
      const ids = oldMessages.map((d) => d._id);
      await Message.deleteMany({ _id: { $in: ids } });
      logger.info(`Archived ${oldMessages.length} messages`);
    }

    await mongoose.connection.close();
    logger.info('Archive job finished');
    process.exit(0);
  } catch (error) {
    logger.error('Archive job failed', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

archiveOldData();

