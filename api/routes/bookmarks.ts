import { Router } from 'express';
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  toggleBookmark,
} from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, createBookmarkSchema, toggleBookmarkSchema } from '../utils/validators.js';

const router = Router();

// All bookmark routes require authentication
router.get('/', protect, getBookmarks);
router.post('/', protect, validate(createBookmarkSchema), addBookmark);
router.post('/toggle', protect, validate(toggleBookmarkSchema), toggleBookmark);
router.delete('/:id', protect, removeBookmark);

export default router;
