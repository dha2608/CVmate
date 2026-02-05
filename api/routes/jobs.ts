import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { getJobs, getJobById, createJob, applyJob, getJobRecommendations } from '../controllers/jobController.js';
import { validate, createJobSchema } from '../utils/validators.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/recommendations', protect, aiLimiter, getJobRecommendations);
router.get('/:id', getJobById);
router.post('/', protect, validate(createJobSchema), createJob);
router.post('/:id/apply', protect, applyJob);

export default router;
