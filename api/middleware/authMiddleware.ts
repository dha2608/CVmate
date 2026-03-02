import jwt, { type JwtPayload } from 'jsonwebtoken';
import { type Request, type Response, type NextFunction, type RequestHandler } from 'express';
import User, { type IUser } from '../models/User.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

export type AuthRequest = Request;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    `JWT_SECRET is not configured or is too short (minimum 32 characters). Current length: ${JWT_SECRET?.length || 0}`
  );
}

export const protect: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];

      const decoded = (jwt as any).verify(token, JWT_SECRET) as JwtPayload & {
        id: string;
      };

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        return;
      }

      if (user.isBanned) {
        res.status(403).json({ success: false, message: 'Account has been banned' });
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
