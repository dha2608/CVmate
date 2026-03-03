import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { AuthRequest } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    let updatedUser = null;
    if (req.user?._id) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: fileUrl },
        { new: true, runValidators: false }
      ).select('name email avatar coverPhoto subscription');
    }

    res.json({
      success: true,
      data: {
        url: fileUrl,
        avatar: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
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

    const fileUrl = `/uploads/${req.file.filename}`;

    let updatedUser = null;
    if (req.user?._id) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { coverPhoto: fileUrl },
        { new: true, runValidators: false }
      ).select('name email avatar coverPhoto subscription');
    }

    res.json({
      success: true,
      data: {
        url: fileUrl,
        coverPhoto: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
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

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const getFileAsBase64 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;
    if (!filename) {
      res.status(400).json({ success: false, message: 'Filename is required' });
      return;
    }

    // Sanitize filename to prevent path traversal
    const sanitized = path.basename(filename);
    if (
      sanitized !== filename ||
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      res.status(400).json({ success: false, message: 'Invalid filename' });
      return;
    }

    const filePath = path.join(__dirname, '../../uploads', sanitized);

    const fs = await import('fs');
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString('base64');
      const mimeType = path.extname(filename).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';

      res.json({
        success: true,
        data: {
          base64: `data:${mimeType};base64,${base64}`,
          filename,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'File not found' });
    }
  } catch (error: any) {
    next(error);
  }
};
