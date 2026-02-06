import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getUserAchievements, getAchievementStats } from '../controllers/achievementController.js';

const router = express.Router();

router.get('/', protect, getUserAchievements);
router.get('/stats', protect, getAchievementStats);

export default router;
