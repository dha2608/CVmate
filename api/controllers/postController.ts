import { Response, NextFunction } from 'express';
import Post from '../models/Post.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const createPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, image } = req.body;
    
    const post = await Post.create({
      user: req.user._id,
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
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar');
    
    res.json({ success: true, data: posts });
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

    const userId = req.user._id;
    // Check if post is already liked
    const index = post.likes.findIndex((id: any) => id.toString() === userId.toString());

    if (index === -1) {
      // Like
      post.likes.push(userId);
    } else {
      // Unlike
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
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const newComment = {
      user: req.user._id,
      text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the user of the new comment to return it
    const updatedPost = await Post.findById(req.params.id)
        .populate('user', 'name avatar')
        .populate('comments.user', 'name avatar');

    res.json({ success: true, data: updatedPost?.comments });
  } catch (error) {
    next(error);
  }
};
