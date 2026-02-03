import { Router } from 'express';
import { createResume, getResumes, getResumeById, updateResume, deleteResume, aiEnhance, analyzeResume, aiGenerateFullResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter, freeUserLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.route('/')
  .post(protect, createResume)
  .get(protect, getResumes);

router.route('/:id')
  .get(protect, getResumeById)
  .put(protect, updateResume)
  .delete(protect, deleteResume);

router.post('/ai-enhance', protect, aiLimiter, aiEnhance);
router.post('/:id/analyze', protect, freeUserLimiter, analyzeResume);
router.post('/ai-generate-full', protect, aiLimiter, aiGenerateFullResume);

export default router;
