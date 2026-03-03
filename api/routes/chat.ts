import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { chatWithAI } from '../controllers/chatController.js';
import { validate, chatMessageSchema } from '../utils/validators.js';

const router = Router();

router.post('/', protect, aiLimiter, validate(chatMessageSchema), chatWithAI);

export default router;
