import express from 'express';
import { protect, protectSSE } from '../middleware/authMiddleware.js';
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  messageEvents,
  postTyping,
} from '../controllers/messageController.js';

const router = express.Router();

// SSE endpoint (must be before /:userId to avoid conflict)
router.get('/events', protectSSE, messageEvents);

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);
router.post('/typing', protect, postTyping);
router.post('/', protect, sendMessage);
router.post('/:userId/read', protect, markConversationRead);

export default router;
