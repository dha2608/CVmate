import { Request, Response, NextFunction } from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Find all unique users communicated with
    const sent = await Message.find({ sender: req.user._id }).distinct('receiver');
    const received = await Message.find({ receiver: req.user._id }).distinct('sender');
    
    const userIds = [...new Set([...sent.map(id => id.toString()), ...received.map(id => id.toString())])];
    
    const users = await User.find({ _id: { $in: userIds } }).select('name avatar');
    
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: userId },
                { sender: userId, receiver: req.user._id }
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
        
        const message = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            content
        });

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        next(error);
    }
};
