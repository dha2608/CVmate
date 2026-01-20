import { Router } from 'express';
import { startInterview, sendMessage, getInterviews } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', protect, startInterview);
router.get('/', protect, getInterviews);
router.post('/:id/message', protect, sendMessage);

export default router;
