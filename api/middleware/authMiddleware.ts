import jwt, { type JwtPayload } from 'jsonwebtoken';
import { type Request, type Response, type NextFunction, type RequestHandler } from 'express';
import User, { type IUser } from '../models/User.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

export type AuthRequest = Request;

export const protect: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];

      if (!process.env.JWT_SECRET) {
        res.status(500).json({ success: false, message: 'JWT_SECRET is not configured' });
        return;
      }

      const decoded = (jwt as any).verify(token, process.env.JWT_SECRET) as JwtPayload & {
        id: string;
      };

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        return;
      }

      req.user = user;
      next();
    } catch (_error) {
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};