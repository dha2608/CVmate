import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { AuthRequest } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
        size: req.file.size
      }
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

    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error: any) {
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
      
      res.json({
        success: true,
        data: {
          base64: `data:${mimeType};base64,${base64}`,
          filename
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'File not found' });
    }
  } catch (error: any) {
    next(error);
  }
};
