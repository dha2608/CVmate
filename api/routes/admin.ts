import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { 
  getPendingPosts, 
  approvePost, 
  rejectPost, 
  banUser, 
  unbanUser 
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

router.get('/posts/pending', getPendingPosts);
router.put('/posts/:id/approve', approvePost);
router.put('/posts/:id/reject', rejectPost);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);

export default router;
