import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  messageEvents,
  postTyping,
} from '../controllers/messageController.js';
import { validate, sendMessageSchema, typingSchema } from '../utils/validators.js';

const router = express.Router();

// SSE endpoint — auth handled inline (writeHead before async for proxy compat)
router.get('/events', messageEvents);

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);
router.post('/typing', protect, validate(typingSchema), postTyping);
router.post('/', protect, validate(sendMessageSchema), sendMessage);
router.post('/:userId/read', protect, markConversationRead);

export default router;
