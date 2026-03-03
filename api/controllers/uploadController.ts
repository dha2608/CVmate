import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { uploadToCloudinary } from '../utils/cloudinaryClient.js';
import User from '../models/User.js';

export const uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const result = await uploadToCloudinary(req.file.buffer, 'avatars', {
      publicId: `avatar_${req.user?._id}_${Date.now()}`,
      transformation: [
        {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    });

    let updatedUser = null;
    if (req.user?._id) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: result.secure_url },
        { new: true, runValidators: false }
      ).select('name email avatar coverPhoto subscription');
    }

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        avatar: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        user: updatedUser,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const uploadCoverPhoto = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const result = await uploadToCloudinary(req.file.buffer, 'covers', {
      publicId: `cover_${req.user?._id}_${Date.now()}`,
      transformation: [
        { width: 1200, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
      ],
    });

    let updatedUser = null;
    if (req.user?._id) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { coverPhoto: result.secure_url },
        { new: true, runValidators: false }
      ).select('name email avatar coverPhoto subscription');
    }

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        coverPhoto: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        user: updatedUser,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const uploadPostImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const result = await uploadToCloudinary(req.file.buffer, 'posts', {
      publicId: `post_${req.user?._id}_${Date.now()}`,
      transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Legacy endpoint — with Cloudinary, files are served directly via secure_url.
// This returns 410 Gone since local disk files no longer exist.
export const getFileAsBase64 = async (req: Request, res: Response) => {
  res.status(410).json({
    success: false,
    message: 'This endpoint is deprecated. Files are now served directly via Cloudinary URLs.',
  });
};
