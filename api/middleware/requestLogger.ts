import type { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, originalUrl } = req;
  const userId = (req as any).user?._id;
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
