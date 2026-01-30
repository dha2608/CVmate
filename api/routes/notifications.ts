import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getNotifications, 
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

// List notifications for current user
router.get('/', protect, getNotifications);

// Mark a single notification as read
router.put('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.put('/read-all', protect, markAllAsRead);

// Delete a notification
router.delete('/:id', protect, deleteNotification);

export default router;
