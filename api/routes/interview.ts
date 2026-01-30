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

// Start a new interview session with a persona
router.post('/start', protect, freeUserLimiter, startInterview);

// List interviews for current user
router.get('/', protect, getInterviews);

// Get details for a specific interview (including chat history & feedback)
router.get('/:id', protect, getInterviewById);

// Send a chat message within an interview session
router.post('/:id/chat', protect, aiLimiter, sendMessage);

// End interview and generate feedback
router.post('/:id/end', protect, aiLimiter, endInterview);

export default router;
