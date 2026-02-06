import { Response, NextFunction } from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

export const getPendingPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar email'),
      Post.countDocuments({ status: 'pending' })
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const approvePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    post.status = 'approved';
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const rejectPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    post.status = 'rejected';
    if (reason) {
      post.rejectedReason = reason;
    }
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.isBanned = true;
    await user.save();

    logger.info('User banned', { userId: user._id, bannedBy: req.user?._id });

    res.json({ success: true, message: 'User banned successfully' });
  } catch (error) {
    next(error);
  }
};

export const unbanUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.isBanned = false;
    await user.save();

    res.json({ success: true, message: 'User unbanned successfully' });
  } catch (error) {
    next(error);
  }
};
