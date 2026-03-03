import { Response, NextFunction } from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Job from '../models/Job.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const getPagination = (req: AuthRequest) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const getAdminOverview = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      usersCount,
      bannedUsersCount,
      postsCount,
      pendingPostsCount,
      articlesCount,
      jobsCount,
      premiumMonthlyCount,
      premiumYearlyCount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Post.countDocuments(),
      Post.countDocuments({ status: 'pending' }),
      Article.countDocuments(),
      Job.countDocuments(),
      User.countDocuments({
        'subscription.plan': 'premium',
        'subscription.status': 'active',
        'subscription.billingCycle': { $ne: 'yearly' },
      }),
      User.countDocuments({
        'subscription.plan': 'premium',
        'subscription.status': 'active',
        'subscription.billingCycle': 'yearly',
      }),
    ]);

    const premiumUsersCount = premiumMonthlyCount + premiumYearlyCount;
    // Revenue: monthly = $8/mo, yearly = $80/yr ($6.67/mo)
    const monthlyRevenue = premiumMonthlyCount * 8;
    const yearlyRevenue = premiumYearlyCount * 80;
    const totalRevenue = monthlyRevenue + yearlyRevenue;

    res.json({
      success: true,
      data: {
        usersCount,
        bannedUsersCount,
        postsCount,
        pendingPostsCount,
        articlesCount,
        jobsCount,
        premiumUsersCount,
        premiumMonthlyCount,
        premiumYearlyCount,
        monthlyRevenue,
        yearlyRevenue,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const search = (req.query.search as string)?.trim();

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -twoFactorSecret')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
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

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role' });
      return;
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({ success: true, data: targetUser });
  } catch (error) {
    next(error);
  }
};

export const updateUserSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { plan, status, endDate } = req.body;
    if (!['free', 'premium'].includes(plan)) {
      res.status(400).json({ success: false, message: 'Invalid plan' });
      return;
    }
    if (!['active', 'cancelled', 'expired'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    targetUser.subscription = {
      ...(targetUser.subscription || { plan: 'free', status: 'active' }),
      plan,
      status,
      endDate: endDate ? new Date(endDate) : undefined,
      startDate: targetUser.subscription?.startDate || new Date(),
    } as any;

    await targetUser.save();
    res.json({ success: true, data: targetUser.subscription });
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?._id?.toString() === req.params.id) {
      res.status(400).json({ success: false, message: 'You cannot ban yourself' });
      return;
    }

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

export const getPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const status = req.query.status as string;
    const query = ['pending', 'approved', 'rejected'].includes(status) ? { status } : {};

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar email'),
      Post.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePostStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, reason } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    post.status = status;
    post.rejectedReason = status === 'rejected' ? reason || '' : undefined;
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getArticles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const [articles, total] = await Promise.all([
      Article.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email avatar'),
      Article.countDocuments(),
    ]);

    res.json({
      success: true,
      data: articles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleArticlePublish = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    article.isPublished = !article.isPublished;
    await article.save();

    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const [jobs, total] = await Promise.all([
      Job.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('postedBy', 'name email avatar'),
      Job.countDocuments(),
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};
