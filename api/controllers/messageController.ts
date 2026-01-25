import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.user?._id;

    const sent = await Message.find({ sender: currentUserId }).distinct('receiver');
    const received = await Message.find({ receiver: currentUserId }).distinct('sender');

    const distinctUserIds = [
      ...new Set([...sent, ...received].map((id) => id.toString()))
    ];

    const users = await User.find({ _id: { $in: distinctUserIds } }).select('name avatar email');

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
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
      content
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};