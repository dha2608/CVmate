import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

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
          $or: [
            { sender: currentUserObjectId },
            { receiver: currentUserObjectId },
          ],
        },
      },
      {
        $addFields: {
          otherUserId: {
            $cond: [
              { $eq: ['$sender', currentUserObjectId] },
              '$receiver',
              '$sender',
            ],
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
                      $or: [
                        { $eq: ['$readAt', null] },
                        { $not: ['$readAt'] },
                      ],
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
        { sender: userId, receiver: currentUserId }
      ]
    };

    const [messages, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments(filter)
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
      }
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      res.status(400).json({ success: false, message: 'Receiver and content are required' });
      return;
    }

    const message = await Message.create({
      sender: req.user?._id,
      receiver: receiverId,
      content,
    });

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

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};