import { Router } from 'express';
import { createResume, getResumes, getResumeById, updateResume, deleteResume, aiEnhance } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.route('/')
  .post(protect, createResume)
  .get(protect, getResumes);

router.route('/:id')
  .get(protect, getResumeById)
  .put(protect, updateResume)
  .delete(protect, deleteResume);

router.post('/enhance', protect, aiEnhance);

export default router;
