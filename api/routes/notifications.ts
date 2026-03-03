import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notificationEvents,
} from '../controllers/notificationController.js';

const router = express.Router();

// SSE endpoint — auth handled inline (writeHead before async for proxy compat)
router.get('/events', notificationEvents);

// List notifications for current user
router.get('/', protect, getNotifications);

// Mark a single notification as read
router.put('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.put('/read-all', protect, markAllAsRead);

// Delete a notification
router.delete('/:id', protect, deleteNotification);

export default router;
