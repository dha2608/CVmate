import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { AuthRequest } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import {
  sendSuccessResponse,
  sendErrorResponse,
  handleValidationError,
  handleServerError,
  handleNotFoundError,
  ErrorCode,
} from '../utils/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      handleValidationError(res, 'No file uploaded');
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    // 立即更新用户记录中的 avatar
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, { avatar: fileUrl });
    }

    sendSuccessResponse(res, {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const uploadCoverPhoto = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      handleValidationError(res, 'No file uploaded');
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    // 立即更新用户记录中的 coverPhoto
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, { coverPhoto: fileUrl });
    }

    sendSuccessResponse(res, {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const uploadPostImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      handleValidationError(res, 'No file uploaded');
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    sendSuccessResponse(res, {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const getFileAsBase64 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    const fs = await import('fs');
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString('base64');
      const mimeType = path.extname(filename).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
      
      sendSuccessResponse(res, {
        base64: `data:${mimeType};base64,${base64}`,
        filename
      });
    } else {
      handleNotFoundError(res, 'File');
    }
  } catch (error: unknown) {
    next(error);
  }
};
