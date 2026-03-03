import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { Types } from 'mongoose';
import User, { IUser } from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { checkAndAwardAchievement } from './achievementController.js';
import logger from '../utils/logger.js';

export const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validation is handled by middleware
    const { name, email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      logger.warn('auth_register_user_exists', { email: normalizedEmail });
      res.status(409).json({ success: false, message: 'User already exists' });
      return;
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
    });

    if (user) {
      logger.info('auth_register_success', { userId: user._id.toString(), email: user.email });
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          careerGoal: user.careerGoal,
          token: generateToken((user._id as Types.ObjectId).toString()),
        },
      });
    } else {
      logger.warn('auth_register_invalid_user_data', { email: normalizedEmail });
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    logger.error('auth_register_error', error);
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validation is handled by middleware
    const { email, password, twoFactorToken } = req.body as {
      email: string;
      password: string;
      twoFactorToken?: string;
    };

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user && user.password) {
      const isPasswordValid = await user.matchPassword(password);

      if (!isPasswordValid) {
        logger.warn('auth_login_invalid_password', { email: normalizedEmail });
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      // If 2FA is enabled, require a valid token to complete login
      if (user.twoFactorEnabled) {
        if (!twoFactorToken) {
          logger.warn('auth_login_2fa_required', { userId: user._id.toString() });
          res.status(401).json({
            success: false,
            requiresTwoFactor: true,
            message: 'Two-factor authentication token is required',
          });
          return;
        }

        // Import lazily to avoid loading otplib unless needed
        const { authenticator } = await import('otplib');
        if (
          !user.twoFactorSecret ||
          !authenticator.verify({ token: twoFactorToken, secret: user.twoFactorSecret })
        ) {
          logger.warn('auth_login_2fa_invalid_token', { userId: user._id.toString() });
          res.status(401).json({
            success: false,
            requiresTwoFactor: true,
            message: 'Invalid two-factor authentication token',
          });
          return;
        }
      }

      logger.info('auth_login_success', { userId: user._id.toString(), email: user.email });
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          careerGoal: user.careerGoal,
          token: generateToken((user._id as Types.ObjectId).toString()),
        },
      });
    } else {
      logger.warn('auth_login_user_not_found', { email: normalizedEmail });
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    logger.error('auth_login_error', error);
    next(error);
  }
};

export const googleAuthCallback = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const user = req.user as IUser | undefined;

    if (!user) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      // Redirect to frontend with error
      res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
      return;
    }

    const token = generateToken((user._id as Types.ObjectId).toString());

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/auth/callback?token=${token}&onboarding=${!user.onboardingCompleted}`
    );
  } catch (_error) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Redirect to frontend with error instead of crashing
    res.redirect(`${frontendUrl}/login?error=google_auth_error`);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      // Handle password update through model to trigger pre-save hook
      if (req.body.password) {
        user.password = req.body.password;
      }

      // Update other fields
      if (req.body.name) {
        user.name = req.body.name;
      }
      if (req.body.email) {
        user.email = req.body.email.toLowerCase().trim();
      }
      if (req.body.bio !== undefined) {
        user.bio = req.body.bio;
      }
      if (req.body.headline !== undefined) {
        user.headline = req.body.headline;
      }
      if (req.body.location !== undefined) {
        user.location = req.body.location;
      }
      if (req.body.yearsOfExperience !== undefined) {
        user.yearsOfExperience = req.body.yearsOfExperience;
      }
      if (req.body.currentRole !== undefined) {
        user.currentRole = req.body.currentRole;
      }
      if (Array.isArray(req.body.industries)) {
        user.industries = req.body.industries;
      }
      if (Array.isArray(req.body.skills)) {
        user.skills = req.body.skills;
      }
      if (req.body.socialLinks) {
        user.socialLinks = {
          ...user.socialLinks,
          ...req.body.socialLinks,
        };
      }
      if (typeof req.body.isPublicProfile === 'boolean') {
        user.isPublicProfile = req.body.isPublicProfile;
      }
      if (req.body.avatar !== undefined) {
        user.avatar = req.body.avatar;
      }
      if (req.body.coverPhoto !== undefined) {
        user.coverPhoto = req.body.coverPhoto;
      }

      const updatedUser = await user.save();

      // Check profile completion (80% threshold)
      const profileFields = [
        updatedUser.name,
        updatedUser.email,
        updatedUser.bio,
        updatedUser.headline,
        updatedUser.location,
        updatedUser.avatar,
        updatedUser.yearsOfExperience,
        updatedUser.currentRole,
        (updatedUser.skills?.length ?? 0) > 0,
        (updatedUser.industries?.length ?? 0) > 0,
      ];
      const completedFields = profileFields.filter(Boolean).length;
      const completionPercentage = (completedFields / profileFields.length) * 100;

      if (completionPercentage >= 80) {
        const userId = req.user?._id?.toString();
        if (userId) {
          await checkAndAwardAchievement(userId, 'complete_profile');
        }
      }

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          coverPhoto: updatedUser.coverPhoto,
          bio: updatedUser.bio,
          headline: updatedUser.headline,
          location: updatedUser.location,
          yearsOfExperience: updatedUser.yearsOfExperience,
          currentRole: updatedUser.currentRole,
          industries: updatedUser.industries,
          skills: updatedUser.skills,
          socialLinks: updatedUser.socialLinks,
          isPublicProfile: updatedUser.isPublicProfile,
          role: updatedUser.role,
          onboardingCompleted: updatedUser.onboardingCompleted,
          careerGoal: updatedUser.careerGoal,
          token: generateToken((updatedUser._id as Types.ObjectId).toString()),
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const completeOnboarding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { careerGoal } = req.body;

    if (!careerGoal || !['new-job', 'internship', 'career-switch'].includes(careerGoal)) {
      res.status(400).json({
        success: false,
        message: 'Invalid career goal. Must be: new-job, internship, or career-switch',
      });
      return;
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.careerGoal = careerGoal as 'new-job' | 'internship' | 'career-switch';
    user.onboardingCompleted = true;
    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        careerGoal: user.careerGoal,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      'name avatar coverPhoto bio headline location yearsOfExperience currentRole industries skills socialLinks isPublicProfile careerGoal createdAt'
    );

    if (!user || user.isPublicProfile === false) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        headline: user.headline,
        location: user.location,
        yearsOfExperience: user.yearsOfExperience,
        currentRole: user.currentRole,
        industries: user.industries || [],
        skills: user.skills || [],
        socialLinks: user.socialLinks || {},
        careerGoal: user.careerGoal,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Delete all related data in parallel
    const db = mongoose.connection.db;
    if (db) {
      await Promise.all([
        db.collection('resumes').deleteMany({ user: user._id }),
        db.collection('posts').deleteMany({ author: user._id }),
        db.collection('messages').deleteMany({
          $or: [{ sender: user._id }, { receiver: user._id }],
        }),
        db.collection('notifications').deleteMany({ user: user._id }),
        db.collection('achievements').deleteMany({ user: user._id }),
        db.collection('interviews').deleteMany({ user: user._id }),
        db.collection('pushsubscriptions').deleteMany({ user: user._id }),
        db.collection('resumehistories').deleteMany({ user: user._id }),
      ]);
    }

    await User.findByIdAndDelete(userId);

    logger.info('auth_account_deleted', { userId: userId.toString(), email: user.email });

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    logger.error('auth_account_delete_error', error);
    next(error);
  }
};
