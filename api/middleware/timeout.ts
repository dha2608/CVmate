import { Request, Response, NextFunction } from 'express';

/**
 * Request Timeout Middleware
 * Prevents requests from hanging indefinitely
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Request timeout',
          message: 'The request took too long to process. Please try again.',
        });
      }
    });
    next();
  };
};
