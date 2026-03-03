import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Bookmark from '../models/Bookmark.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getBookmarks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const type = req.query.type as string | undefined;

    const query: Record<string, unknown> = { user: userId };
    if (type === 'job' || type === 'article') {
      query.type = type;
    }

    const bookmarks = await Bookmark.find(query).sort({ createdAt: -1 }).lean();

    res.json({ success: true, data: bookmarks });
  } catch (error) {
    next(error);
  }
};

export const addBookmark = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const { type, itemId } = req.body;

    if (!type || !itemId) {
      res.status(400).json({ success: false, message: 'type and itemId are required' });
      return;
    }

    if (type !== 'job' && type !== 'article') {
      res.status(400).json({ success: false, message: 'type must be "job" or "article"' });
      return;
    }

    if (!Types.ObjectId.isValid(itemId)) {
      res.status(400).json({ success: false, message: 'Invalid itemId' });
      return;
    }

    // Check if already bookmarked
    const existing = await Bookmark.findOne({ user: userId, type, itemId });
    if (existing) {
      res.status(409).json({ success: false, message: 'Already bookmarked' });
      return;
    }

    const bookmark = await Bookmark.create({
      user: userId,
      type,
      itemId,
    });

    res.status(201).json({ success: true, data: bookmark });
  } catch (error) {
    next(error);
  }
};

export const removeBookmark = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid bookmark ID' });
      return;
    }

    const bookmark = await Bookmark.findOneAndDelete({ _id: id, user: userId });

    if (!bookmark) {
      res.status(404).json({ success: false, message: 'Bookmark not found' });
      return;
    }

    res.json({ success: true, message: 'Bookmark removed' });
  } catch (error) {
    next(error);
  }
};

export const toggleBookmark = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const { type, itemId } = req.body;

    if (!type || !itemId) {
      res.status(400).json({ success: false, message: 'type and itemId are required' });
      return;
    }

    if (type !== 'job' && type !== 'article') {
      res.status(400).json({ success: false, message: 'type must be "job" or "article"' });
      return;
    }

    if (!Types.ObjectId.isValid(itemId)) {
      res.status(400).json({ success: false, message: 'Invalid itemId' });
      return;
    }

    const existing = await Bookmark.findOne({ user: userId, type, itemId });

    if (existing) {
      await existing.deleteOne();
      res.json({ success: true, data: null, bookmarked: false, message: 'Bookmark removed' });
    } else {
      const bookmark = await Bookmark.create({ user: userId, type, itemId });
      res
        .status(201)
        .json({ success: true, data: bookmark, bookmarked: true, message: 'Bookmarked' });
    }
  } catch (error) {
    next(error);
  }
};
