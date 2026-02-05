import type { Request, Response, NextFunction } from 'express';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import User from '../models/User.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

const APP_NAME = process.env.APP_NAME || 'CVmate';

export const generateTwoFactorSecret = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, APP_NAME, secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauth);

    // Store secret temporarily; it will be finalized when user confirms with a valid token
    user.twoFactorSecret = secret;
    await user.save();

    res.json({
      success: true,
      data: {
        otpauthUrl: otpauth,
        qrCodeDataUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const enableTwoFactor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body as { token?: string };

    if (!req.user?._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!token) {
      res.status(400).json({ success: false, message: '2FA token is required' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.twoFactorSecret) {
      res.status(400).json({ success: false, message: '2FA is not initialized' });
      return;
    }

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Invalid 2FA token' });
      return;
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ success: true, message: 'Two-factor authentication enabled' });
  } catch (error) {
    next(error);
  }
};

export const disableTwoFactor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body as { token?: string };

    if (!req.user?._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
      res.status(400).json({ success: false, message: '2FA is not enabled' });
      return;
    }

    if (!token || !authenticator.verify({ token, secret: user.twoFactorSecret })) {
      res.status(401).json({ success: false, message: 'Invalid 2FA token' });
      return;
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null as any;
    await user.save();

    res.json({ success: true, message: 'Two-factor authentication disabled' });
  } catch (error) {
    next(error);
  }
};

