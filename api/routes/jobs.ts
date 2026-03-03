import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import {
  getJobs,
  getJobById,
  createJob,
  applyJob,
  getJobRecommendations,
  getMyPostedJobs,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from '../controllers/jobController.js';
import { validate, createJobSchema } from '../utils/validators.js';

const router = express.Router();

// ── Static/named routes first (must come before /:id) ────────────────────────
router.get('/', getJobs);
router.get('/recommendations', protect, aiLimiter, getJobRecommendations);
router.get('/my-posts', protect, getMyPostedJobs);
router.get('/my-applications', protect, getMyApplications);

// ── Dynamic routes ────────────────────────────────────────────────────────────
router.get('/:id', getJobById);
router.post('/', protect, validate(createJobSchema), createJob);
router.post('/:id/apply', protect, applyJob);
router.get('/:id/applications', protect, getJobApplications);
router.patch('/:jobId/applications/:appId', protect, updateApplicationStatus);

export default router;
