import { Router } from 'express';
import { 
  startInterview, 
  sendMessage, 
  getInterviews,
  getInterviewById,
  endInterview,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter, freeUserLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/start', protect, freeUserLimiter, startInterview);
router.get('/', protect, getInterviews);
router.get('/:id', protect, getInterviewById);
router.post('/:id/chat', protect, aiLimiter, sendMessage);
router.post('/:id/end', protect, aiLimiter, endInterview);

export default router;
