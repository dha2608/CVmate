import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Post from '../models/Post.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const createPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, image } = req.body;
    
    if (!content && !image) {
      res.status(400).json({ success: false, message: 'Content or image is required' });
      return;
    }

    const post = await Post.create({
      user: req.user?._id,
      content,
      image
    });

    const populatedPost = await Post.findById(post._id).populate('user', 'name avatar');

    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar')
        .populate('comments.user', 'name avatar'),
      Post.countDocuments()
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

export const likePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const userId = (req.user?._id as Types.ObjectId).toString();
    const index = post.likes.findIndex((id: any) => id.toString() === userId);

    if (index === -1) {
      post.likes.push(req.user?._id);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ success: true, data: post.likes });
  } catch (error) {
    next(error);
  }
};

export const commentPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      res.status(400).json({ success: false, message: 'Comment text is required' });
      return;
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const newComment = {
      user: req.user?._id,
      text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
        .populate('user', 'name avatar')
        .populate('comments.user', 'name avatar');

    res.json({ success: true, data: updatedPost?.comments });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    if (post.user.toString() !== req.user?._id.toString()) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    await post.deleteOne();

    res.json({ success: true, message: 'Post removed' });
  } catch (error) {
    next(error);
  }
};