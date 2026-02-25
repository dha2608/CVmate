import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import User, { IUser } from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { checkAndAwardAchievement } from './achievementController.js';

export const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};


export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    // Validation is now handled by middleware, but keep as fallback
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    // Normalize email to lowercase for consistent lookup
    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      res.status(409).json({ success: false, message: 'User already exists' });
      return;
    }

    // Password will be hashed automatically by User model's pre('save') hook
    const user = await User.create({
      name,
      email: normalizedEmail,
      password, // Pass plain password, pre('save') hook will hash it
    });

    if (user) {
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
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, twoFactorToken } = req.body as {
      email?: string;
      password?: string;
      twoFactorToken?: string;
    };

    // Validation is now handled by middleware, but keep as fallback
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    // Normalize email to lowercase for consistent lookup
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user && user.password) {
      // Use the model's matchPassword method for consistency
      const isPasswordValid = await user.matchPassword(password);
      
      if (!isPasswordValid) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      // If 2FA is enabled, require a valid token to complete login
      if (user.twoFactorEnabled) {
        if (!twoFactorToken) {
          res.status(401).json({
            success: false,
            requiresTwoFactor: true,
            message: 'Two-factor authentication token is required',
          });
          return;
        }

        // Import lazily to avoid loading otplib unless needed
        const { authenticator } = await import('otplib');
        if (!user.twoFactorSecret || !authenticator.verify({ token: twoFactorToken, secret: user.twoFactorSecret })) {
          res.status(401).json({
            success: false,
            requiresTwoFactor: true,
            message: 'Invalid two-factor authentication token',
          });
          return;
        }
      }

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
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
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
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&onboarding=${!user.onboardingCompleted}`);
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
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.headline = req.body.headline !== undefined ? req.body.headline : user.headline;
      user.location = req.body.location !== undefined ? req.body.location : user.location;
      user.yearsOfExperience = req.body.yearsOfExperience ?? user.yearsOfExperience;
      user.currentRole = req.body.currentRole !== undefined ? req.body.currentRole : user.currentRole;
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
      user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;
      user.coverPhoto = req.body.coverPhoto !== undefined ? req.body.coverPhoto : user.coverPhoto;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
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
        message: 'Invalid career goal. Must be: new-job, internship, or career-switch' 
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

    const user = await User.findById(id).select('name avatar bio headline location yearsOfExperience currentRole industries skills socialLinks isPublicProfile careerGoal createdAt');

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
