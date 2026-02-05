import { Router } from 'express';
import { 
  startInterview, 
  sendMessage, 
  getInterviews,
  getInterviewById,
  endInterview,
  getInterviewAnalytics,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter, freeUserLimiter } from '../middleware/rateLimiter.js';
import { validate, startInterviewSchema, sendInterviewMessageSchema } from '../utils/validators.js';

const router = Router();

router.post('/start', protect, freeUserLimiter, validate(startInterviewSchema), startInterview);
router.get('/', protect, getInterviews);
router.get('/analytics/summary', protect, getInterviewAnalytics);
router.get('/:id', protect, getInterviewById);
router.post('/:id/chat', protect, aiLimiter, validate(sendInterviewMessageSchema), sendMessage);
router.post('/:id/end', protect, aiLimiter, endInterview);

export default router;
