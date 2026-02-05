import type { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

interface RequestWithUser extends Request {
  user?: { _id?: string };
}

export const requestLogger = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, originalUrl } = req;
  const userId = req.user?._id;
  const userAgent = req.get('user-agent');

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info(`HTTP ${method} ${originalUrl}`, {
      status: res.statusCode,
      durationMs,
      ip: req.ip,
      userId,
      userAgent,
    });
  });

  next();
};
