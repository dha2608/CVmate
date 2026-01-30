import { Response, NextFunction } from 'express';
import User from '../models/User.js';
import { AuthRequest } from './authMiddleware.js';

// Middleware để check xem user có premium subscription không
export const requirePremium = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const subscription = user.subscription || { plan: 'free', status: 'active' };

    // Check if premium subscription is expired
    if (subscription.plan === 'premium' && subscription.endDate) {
      if (new Date() > subscription.endDate) {
        subscription.status = 'expired';
        subscription.plan = 'free';
        await user.save();
      }
    }

    if (subscription.plan !== 'premium' || subscription.status !== 'active') {
      res.status(403).json({ 
        success: false, 
        message: 'Premium subscription required',
        requiresPremium: true 
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
