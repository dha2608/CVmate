import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getResumeTemplates, seedDefaultTemplates } from '../controllers/templateController.js';

const router = Router();

router.get('/resumes', protect, getResumeTemplates);

// Optional admin seeding route (can be protected by role in the future)
router.post('/resumes/seed-defaults', seedDefaultTemplates);

export default router;

