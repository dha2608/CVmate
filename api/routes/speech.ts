import { Router } from 'express';
import { speechToText, getSpeechInstructions } from '../controllers/speechController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/transcribe', protect, aiLimiter, speechToText);
router.get('/instructions', getSpeechInstructions);

export default router;
