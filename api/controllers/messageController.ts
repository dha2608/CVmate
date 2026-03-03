import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

/**
 * In-memory typing state.
 * Maps recipientId -> { senderId, senderName, timestamp }
 * Works on local dev; on Vercel serverless each instance is isolated (graceful degradation).
 */
const typingState = new Map<string, { senderId: string; senderName: string; timestamp: number }>();

/** In-memory event bus for SSE clients. Maps userId -> Set of response writers. */
const sseClients = new Map<string, Set<Response>>();

/** Broadcast an SSE event to a specific user. */
function broadcastToUser(userId: string, event: string, data: unknown) {
  const clients = sseClients.get(userId);
  if (!clients) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    res.write(payload);
  }
}

export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserObjectId }, { receiver: currentUserObjectId }],
        },
      },
      {
        $addFields: {
          otherUserId: {
            $cond: [{ $eq: ['$sender', currentUserObjectId] }, '$receiver', '$sender'],
          },
        },
      },
      // Sort ascending so $last gives us the latest message
      {
        $sort: { createdAt: 1 },
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessage: { $last: '$content' },
          lastMessageAt: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', currentUserObjectId] },
                    {
                      $or: [{ $eq: ['$readAt', null] }, { $not: ['$readAt'] }],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { lastMessageAt: -1 },
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: '$user._id',
          name: '$user.name',
          avatar: '$user.avatar',
          email: '$user.email',
          unreadCount: 1,
          lastMessage: { $ifNull: ['$lastMessage', ''] },
        },
      },
    ]);

    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    };

    const [messages, total] = await Promise.all([
      Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Message.countDocuments(filter),
    ]);

    // Trả về theo thứ tự cũ (tăng dần) để UI không phải đảo
    const orderedMessages = [...messages].reverse();

    res.json({
      success: true,
      data: orderedMessages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { receiverId, content, image } = req.body;

    if (!receiverId || (!content && !image)) {
      res
        .status(400)
        .json({ success: false, message: 'Receiver and content or image are required' });
      return;
    }

    const message = await Message.create({
      sender: req.user?._id,
      receiver: receiverId,
      content: content || '',
      ...(image ? { image } : {}),
    });

    const messagePayload = {
      _id: message._id,
      sender: req.user?._id,
      receiver: receiverId,
      content: message.content,
      image: message.image || null,
      createdAt: message.createdAt,
    };

    // Broadcast new message to receiver via SSE
    broadcastToUser(receiverId, 'new_message', messagePayload);

    // Also broadcast to sender (for multi-tab/device sync)
    const senderId = req.user?._id?.toString();
    if (senderId) {
      broadcastToUser(senderId, 'message_sent', messagePayload);
    }

    // Clear typing state when message is sent
    typingState.delete(receiverId);

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

export const markConversationRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        readAt: { $exists: false },
      },
      {
        $set: { readAt: new Date() },
      }
    );

    // Notify sender that their messages were read
    if (typeof userId === 'string') {
      broadcastToUser(userId, 'messages_read', {
        readBy: currentUserId.toString(),
      });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * SSE endpoint for real-time message events.
 * Token is passed as query param since EventSource cannot set headers.
 *
 * Events emitted:
 * - new_message: A new message was received
 * - message_sent: Confirmation of sent message (multi-tab sync)
 * - typing: Someone is typing to this user
 * - typing_stop: Someone stopped typing
 * - messages_read: Messages were read by recipient
 * - heartbeat: Keep-alive ping
 */
export const messageEvents = async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id?.toString();
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  // Set SSE headers — CORS is handled by the Express cors middleware (via res.setHeader),
  // which validates origins against the allowlist. writeHead merges those headers automatically.
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Send initial connected event
  res.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);

  // Register this client
  if (!sseClients.has(userId)) {
    sseClients.set(userId, new Set());
  }
  sseClients.get(userId)!.add(res);

  // Heartbeat every 15s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`:heartbeat\n\n`);
  }, 15000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    const clients = sseClients.get(userId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        sseClients.delete(userId);
      }
    }
  });
};

/**
 * POST /api/messages/typing
 * Notify that current user is typing to a recipient.
 */
export const postTyping = async (req: AuthRequest, res: Response) => {
  const senderId = req.user?._id?.toString();
  const senderName = req.user?.name || 'Someone';
  const { recipientId } = req.body;

  if (!senderId || !recipientId) {
    res.status(400).json({ success: false, message: 'recipientId is required' });
    return;
  }

  // Store typing state
  typingState.set(recipientId, { senderId, senderName, timestamp: Date.now() });

  // Broadcast to recipient immediately
  broadcastToUser(recipientId, 'typing', { senderId, senderName });

  // Auto-clear after 3 seconds
  setTimeout(() => {
    const state = typingState.get(recipientId);
    if (state && state.senderId === senderId && Date.now() - state.timestamp >= 2900) {
      typingState.delete(recipientId);
      broadcastToUser(recipientId, 'typing_stop', { senderId });
    }
  }, 3000);

  res.json({ success: true });
};
