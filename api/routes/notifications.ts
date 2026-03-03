import express from 'express';
import { protect, protectSSE } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notificationEvents,
} from '../controllers/notificationController.js';

const router = express.Router();

// SSE endpoint for real-time notifications (must be before any /:id routes)
router.get('/events', protectSSE, notificationEvents);

// List notifications for current user
router.get('/', protect, getNotifications);

// Mark a single notification as read
router.put('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.put('/read-all', protect, markAllAsRead);

// Delete a notification
router.delete('/:id', protect, deleteNotification);

export default router;
