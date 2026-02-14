import { Response, NextFunction } from 'express';
import Analytics from '../models/Analytics.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

/**
 * Track analytics event
 * POST /api/analytics/track
 */
export const trackEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventName, payload, sessionId } = req.body;

    if (!eventName || typeof eventName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Event name is required',
      });
    }

    // Get user IP and user agent
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const url = req.headers.referer || req.headers.origin || 'unknown';
    const referrer = req.headers.referer || '';

    // Create analytics record
    const analytics = await Analytics.create({
      eventName,
      userId: req.user?._id,
      sessionId: sessionId || req.headers['x-session-id']?.toString(),
      payload: payload || {},
      userAgent,
      ip,
      url,
      referrer,
      timestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      data: {
        id: analytics._id,
        eventName: analytics.eventName,
        timestamp: analytics.timestamp,
      },
    });
  } catch (error: unknown) {
    logger.error('Analytics tracking error', error instanceof Error ? error : new Error(String(error)), {
      userId: req.user?._id,
    });
    // Don't fail the request if analytics fails
    res.status(200).json({
      success: true,
      message: 'Event tracked (logging may have failed)',
    });
  }
};

/**
 * Get analytics summary (Admin only)
 * GET /api/analytics/summary
 */
export const getAnalyticsSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, eventName } = req.query;

    const query: Record<string, unknown> = {};
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate as string);
      }
    }

    if (eventName) {
      query.eventName = eventName;
    }

    // Get event counts
    const eventCounts = await Analytics.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$eventName',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          eventName: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get total events
    const totalEvents = await Analytics.countDocuments(query);

    // Get unique users
    const uniqueUsers = await Analytics.distinct('userId', query);

    res.json({
      success: true,
      data: {
        totalEvents,
        uniqueUsers: uniqueUsers.filter(Boolean).length,
        eventCounts,
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Analytics summary error', error instanceof Error ? error : new Error(String(error)));
    next(error);
  }
};

/**
 * Get user analytics (for the authenticated user)
 * GET /api/analytics/user
 */
export const getUserAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { startDate, endDate } = req.query;

    const query: Record<string, unknown> = {
      userId: req.user._id,
    };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate as string);
      }
    }

    // Get user event counts
    const eventCounts = await Analytics.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$eventName',
          count: { $sum: 1 },
          lastOccurrence: { $max: '$timestamp' },
        },
      },
      {
        $project: {
          eventName: '$_id',
          count: 1,
          lastOccurrence: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get total events for user
    const totalEvents = await Analytics.countDocuments(query);

    res.json({
      success: true,
      data: {
        totalEvents,
        eventCounts,
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  } catch (error: unknown) {
    logger.error('User analytics error', error instanceof Error ? error : new Error(String(error)), {
      userId: req.user?._id,
    });
    next(error);
  }
};
