import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  eventName: string;
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  payload?: Record<string, unknown>;
  userAgent?: string;
  ip?: string;
  url?: string;
  referrer?: string;
  timestamp: Date;
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    eventName: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    userAgent: String,
    ip: String,
    url: String,
    referrer: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
AnalyticsSchema.index({ eventName: 1, timestamp: -1 });
AnalyticsSchema.index({ userId: 1, timestamp: -1 });
AnalyticsSchema.index({ createdAt: -1 });

// Auto-delete documents older than 90 days
AnalyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics;
