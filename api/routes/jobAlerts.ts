import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMyAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  toggleAlert,
} from '../controllers/jobAlertController.js';
import { validate, createJobAlertSchema, updateJobAlertSchema } from '../utils/validators.js';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/', getMyAlerts);
router.post('/', validate(createJobAlertSchema), createAlert);
router.put('/:id', validate(updateJobAlertSchema), updateAlert);
router.delete('/:id', deleteAlert);
router.patch('/:id/toggle', toggleAlert);

export default router;
