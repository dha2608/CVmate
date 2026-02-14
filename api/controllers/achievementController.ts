import { Response, NextFunction } from 'express';
import Achievement from '../models/Achievement.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendSuccessResponse } from '../utils/errorHandler.js';

export const getUserAchievements = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const achievements = await Achievement.find({ user: userId })
      .sort({ unlockedAt: -1 });
    
    sendSuccessResponse(res, achievements);
  } catch (error) {
    next(error);
  }
};

export const checkAndAwardAchievement = async (
  userId: string,
  type: 'first_cv' | 'complete_profile' | 'apply_job' | 'write_post' | 'complete_interview',
  metadata?: any
): Promise<boolean> => {
  try {
    // Check if already unlocked
    const existing = await Achievement.findOne({ user: userId, type });
    if (existing) return false;

    // Award achievement
    await Achievement.create({
      user: userId,
      type,
      metadata: metadata || {}
    });

    return true;
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return false;
  }
};

export const getAchievementStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const achievements = await Achievement.find({ user: userId });
    
    const stats = {
      total: achievements.length,
      types: {
        first_cv: achievements.some(a => a.type === 'first_cv'),
        complete_profile: achievements.some(a => a.type === 'complete_profile'),
        apply_job: achievements.some(a => a.type === 'apply_job'),
        write_post: achievements.some(a => a.type === 'write_post'),
        complete_interview: achievements.some(a => a.type === 'complete_interview'),
      }
    };

    sendSuccessResponse(res, stats);
  } catch (error) {
    next(error);
  }
};
