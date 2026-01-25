import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import Resume from '../models/Resume.js';
import Post from '../models/Post.js';
import Article from '../models/Article.js';
import Interview from '../models/Interview.js';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;

    const [cvCount, postCount, articleCount, interviewCount] = await Promise.all([
      Resume.countDocuments({ user: userId }),
      Post.countDocuments({ user: userId }),
      Article.countDocuments({ author: userId }),
      Interview.countDocuments({ user: userId })
    ]);

    res.json({
      success: true,
      data: {
        cvCount,
        postCount,
        articleCount,
        interviewCount
      }
    });
  } catch (error) {
    next(error);
  }
};