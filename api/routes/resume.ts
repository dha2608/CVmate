import { Router } from 'express';
import {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  aiEnhance,
  analyzeResume,
  aiGenerateFullResume,
  getResumeHistory,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter, freeUserLimiter } from '../middleware/rateLimiter.js';
import {
  validate,
  createResumeSchema,
  aiEnhanceSchema,
  aiGenerateFullSchema,
} from '../utils/validators.js';

const router = Router();

router
  .route('/')
  .post(protect, validate(createResumeSchema), createResume)
  .get(protect, getResumes);

router
  .route('/:id')
  .get(protect, getResumeById)
  .put(protect, updateResume)
  .delete(protect, deleteResume);

router.get('/:id/history', protect, getResumeHistory);

router.post('/ai-enhance', protect, aiLimiter, validate(aiEnhanceSchema), aiEnhance);
router.post('/:id/analyze', protect, freeUserLimiter, analyzeResume);
router.post(
  '/ai-generate-full',
  protect,
  aiLimiter,
  validate(aiGenerateFullSchema),
  aiGenerateFullResume
);

export default router;
