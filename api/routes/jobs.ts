import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getJobs, getJobById, createJob, applyJob } from '../controllers/jobController.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', protect, createJob);
router.post('/:id/apply', protect, applyJob);
router.post('/:id/apply', protect, applyJob);

export default router;
