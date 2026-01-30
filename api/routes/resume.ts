import { Router } from 'express';
import { createResume, getResumes, getResumeById, updateResume, deleteResume, aiEnhance, analyzeResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.route('/')
  .post(protect, createResume)
  .get(protect, getResumes);

router.route('/:id')
  .get(protect, getResumeById)
  .put(protect, updateResume)
  .delete(protect, deleteResume);

router.post('/ai-enhance', protect, aiEnhance);
router.post('/:id/analyze', protect, analyzeResume);

export default router;
