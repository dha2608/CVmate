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
      recentInterviews
    ] = await Promise.all([
      // 1. Resume Statistics (Count & Average ATS Score)
      Resume.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgAtsScore: { $avg: '$atsScore' }
          }
        }
      ]),

      // 2. Interview Statistics (Count & Average Performance Score)
      Interview.aggregate([
        { $match: { user: userId, isCompleted: true } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgScore: { $avg: '$feedback.score' }
          }
        }
      ]),

      // 3. Simple Counts
      Post.countDocuments({ user: userId }),
      Article.countDocuments({ author: userId }),
      Job.countDocuments({ applicants: userId }),

      // 4. Recent Activities (For Quick Access UI)
      Resume.find({ user: userId })
        .select('title atsScore themeConfig.template updatedAt')
        .sort({ updatedAt: -1 })
        .limit(3),

      Interview.find({ user: userId })
        .select('persona feedback.score createdAt isCompleted')
        .sort({ createdAt: -1 })
        .limit(3)
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
        }
      }
    });
  } catch (error) {
    next(error);
  }
};