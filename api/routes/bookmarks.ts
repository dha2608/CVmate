import { Router } from 'express';
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  toggleBookmark,
} from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All bookmark routes require authentication
router.get('/', protect, getBookmarks);
router.post('/', protect, addBookmark);
router.post('/toggle', protect, toggleBookmark);
router.delete('/:id', protect, removeBookmark);

export default router;
