import { Response, NextFunction } from 'express';
import Notification from '../models/Notification.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { getSseCorsHeaders } from '../utils/cors.js';

// ── SSE infrastructure ──────────────────────────────────────────
const sseClients = new Map<string, Set<Response>>();

/**
 * Broadcast a notification event to a connected user via SSE.
 * Called from other controllers when a notification is created.
 */
export function broadcastNotification(userId: string, notification: unknown): void {
  const clients = sseClients.get(userId);
  if (!clients || clients.size === 0) return;

  const payload = `event: new_notification\ndata: ${JSON.stringify(notification)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch {
      clients.delete(res);
    }
  }
}

/**
 * SSE endpoint for real-time notification streaming.
 * GET /api/notifications/events?token=JWT
 */
export const notificationEvents = async (req: AuthRequest, res: Response) => {
  const userId = (req.user?._id as import('mongoose').Types.ObjectId).toString();

  // SSE headers — explicit validated CORS headers required for writeHead()
  // because Express cors middleware's setHeader() headers don't survive proxy 502s.
  const corsHeaders = getSseCorsHeaders(req.headers.origin);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    ...corsHeaders,
  });

  // Send initial unread count
  const unread = await Notification.countDocuments({ recipient: req.user?._id, read: false });
  res.write(`event: connected\ndata: ${JSON.stringify({ unread })}\n\n`);

  // Register client
  if (!sseClients.has(userId)) {
    sseClients.set(userId, new Set());
  }
  sseClients.get(userId)!.add(res);

  // Heartbeat every 15s
  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 15000);

  // Cleanup on close
  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.get(userId)?.delete(res);
    if (sseClients.get(userId)?.size === 0) {
      sseClients.delete(userId);
    }
  });
};

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const [notifications, total, unread] = await Promise.all([
      Notification.find({ recipient: req.user?._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name avatar'),
      Notification.countDocuments({ recipient: req.user?._id }),
      Notification.countDocuments({ recipient: req.user?._id, read: false }),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        unread,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user?._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await Notification.updateMany({ recipient: req.user?._id, read: false }, { read: true });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user?._id,
    });

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
