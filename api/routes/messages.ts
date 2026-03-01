import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getConversations, getMessages, sendMessage, markConversationRead } from '../controllers/messageController.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);
router.post('/', protect, sendMessage);
router.post('/:userId/read', protect, markConversationRead);

export default router;
