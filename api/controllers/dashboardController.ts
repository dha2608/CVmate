import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import Resume from '../models/Resume.js';
import Post from '../models/Post.js';
import Article from '../models/Article.js';
import Interview from '../models/Interview.js';
import Job from '../models/Job.js';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;

    const [
      resumeStats,
      interviewStats,
      postCount,
      articleCount,
      jobApplicationCount,
      recentResumes,
      recentInterviews,
    ] = await Promise.all([
      // 1. Resume Statistics
      Resume.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgAtsScore: { $avg: '$atsScore' },
          },
        },
      ]),

      // 2. Interview Statistics
      Interview.aggregate([
        { $match: { user: userId, status: 'completed' } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgScore: { $avg: '$feedback.confidenceScore' },
          },
        },
      ]),

      // 3. Simple Counts
      Post.countDocuments({ user: userId }),
      Article.countDocuments({ author: userId }),
      Job.countDocuments({ applicants: userId }),

      // 4. Recent Activities
      Resume.find({ user: userId })
        .select('title atsScore themeConfig.template updatedAt')
        .sort({ updatedAt: -1 })
        .limit(3),

      Interview.find({ user: userId })
        .select('persona feedback.score createdAt isCompleted')
        .sort({ createdAt: -1 })
        .limit(3),
    ]);

    // Process Aggregated Data
    const totalResumes = resumeStats[0]?.count || 0;
    const avgAtsScore = Math.round(resumeStats[0]?.avgAtsScore || 0);

    const totalInterviews = interviewStats[0]?.count || 0;
    const avgInterviewScore = Math.round(interviewStats[0]?.avgScore || 0); // Assuming 0-10 or 0-100 scale

    res.json({
      success: true,
      data: {
        overview: {
          resumes: totalResumes,
          interviews: totalInterviews,
          posts: postCount,
          articles: articleCount,
          applications: jobApplicationCount,
        },
        performance: {
          avgAtsScore,
          avgInterviewScore,
        },
        recent: {
          resumes: recentResumes,
          interviews: recentInterviews,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getActivities = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 30);

    const [resumes, interviews, posts, articles] = await Promise.all([
      Resume.find({ user: userId })
        .select('title updatedAt createdAt')
        .sort({ updatedAt: -1 })
        .limit(limit),
      Interview.find({ user: userId })
        .select('persona status createdAt')
        .sort({ createdAt: -1 })
        .limit(limit),
      Post.find({ user: userId }).select('content createdAt').sort({ createdAt: -1 }).limit(limit),
      Article.find({ author: userId })
        .select('title createdAt')
        .sort({ createdAt: -1 })
        .limit(limit),
    ]);

    const activities: any[] = [];

    for (const r of resumes) {
      activities.push({
        id: r._id,
        type: 'resume',
        action: 'updated',
        title: r.title || 'Untitled CV',
        timestamp: r.updatedAt || r.createdAt,
        link: `/builder?id=${r._id}`,
      });
    }

    for (const iv of interviews) {
      activities.push({
        id: iv._id,
        type: 'interview',
        action: iv.status === 'completed' ? 'completed' : 'started',
        title: iv.persona,
        timestamp: iv.createdAt,
        link: '/interview',
      });
    }

    for (const p of posts) {
      const preview = (p.content || '').slice(0, 60);
      activities.push({
        id: p._id,
        type: 'post',
        action: 'created',
        title: preview || 'Post',
        timestamp: p.createdAt,
        link: '/community',
      });
    }

    for (const a of articles) {
      activities.push({
        id: a._id,
        type: 'article',
        action: 'published',
        title: a.title || 'Article',
        timestamp: a.createdAt,
        link: `/blog/${a._id}`,
      });
    }

    // Sort all activities by timestamp descending, take limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      success: true,
      data: activities.slice(0, limit),
    });
  } catch (error) {
    next(error);
  }
};
