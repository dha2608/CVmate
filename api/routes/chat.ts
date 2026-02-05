import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { chatWithAI } from '../controllers/chatController.js';

const router = Router();

router.post('/', protect, aiLimiter, chatWithAI);

export default router;
