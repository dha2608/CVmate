import { Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { checkAndAwardAchievement } from './achievementController.js';

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

    const populatedPost = await Post.findById(post._id).populate('user', 'name avatar careerGoal location');

    // Check for write_post achievement
    const postCount = await Post.countDocuments({ user: req.user?._id });
    if (postCount === 1) {
      const userId = req.user?._id?.toString();
      if (userId) {
        await checkAndAwardAchievement(userId, 'write_post', {
          postId: post._id.toString(),
        });
      }
    }

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

    // Admin can see all posts, regular users only see approved posts
    const isAdmin = req.user?.role === 'admin';
    const query = isAdmin ? {} : { status: 'approved' };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar careerGoal location')
        .populate('comments.user', 'name avatar careerGoal location'),
      Post.countDocuments(query)
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
      post.likes.push(req.user?._id as Types.ObjectId);

      // Tạo notification khi được like (không gửi cho chính mình)
      if (post.user.toString() !== userId) {
        await Notification.create({
          recipient: post.user,
          sender: req.user?._id,
          type: 'like',
          message: 'đã thích bài viết của bạn.',
          link: `/community`,
        });
      }
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
    const { text, parentId } = req.body;
    
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
      _id: new mongoose.Types.ObjectId(),
      user: req.user?._id,
      text,
      likes: [],
      parentId: parentId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    post.comments.push(newComment as any); 
    
    await post.save();

    // Tạo notification khi có bình luận (không gửi cho chính mình)
    const recipientId = parentId 
      ? post.comments.find((c: any) => c._id.toString() === parentId)?.user 
      : post.user;
    
    if (recipientId && recipientId.toString() !== (req.user?._id as Types.ObjectId).toString()) {
      await Notification.create({
        recipient: recipientId,
        sender: req.user?._id,
        type: 'comment',
        message: parentId ? 'đã trả lời bình luận của bạn.' : 'đã bình luận trên bài viết của bạn.',
        link: `/community?post=${req.params.id}&comment=${newComment._id}`,
        relatedId: req.params.id,
      });
    }

    const updatedPost = await Post.findById(req.params.id)
        .populate('user', 'name avatar')
        .populate('comments.user', 'name avatar');

    res.json({ success: true, data: updatedPost?.comments });
  } catch (error) {
    next(error);
  }
};

export const likeComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const comment = (post.comments as any).id(req.params.commentId);
    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
    }

    const userId = (req.user?._id as Types.ObjectId).toString();
    const likes = comment.likes || [];
    const index = likes.findIndex((id: any) => id.toString() === userId);

    if (index === -1) {
      likes.push(req.user?._id);
    } else {
      likes.splice(index, 1);
    }

    comment.likes = likes;
    await post.save();

    res.json({ success: true, data: likes });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const comment = (post.comments as any).id(req.params.commentId);
    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
    }

    if (comment.user.toString() !== (req.user?._id as Types.ObjectId).toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    comment.text = text;
    comment.updatedAt = new Date();
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
        .populate('user', 'name avatar')
        .populate('comments.user', 'name avatar');

    res.json({ success: true, data: updatedPost?.comments });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const comment = (post.comments as any).id(req.params.commentId);
    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
    }

    if (comment.user.toString() !== (req.user?._id as Types.ObjectId).toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Remove comment and all its replies
    post.comments = post.comments.filter((c: any) => {
      return c._id.toString() !== req.params.commentId && 
             c.parentId?.toString() !== req.params.commentId;
    });

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