import { Router } from 'express';
import { trackEvent, getAnalyticsSummary, getUserAnalytics } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

/**
 * POST /api/analytics/track
 * Track an analytics event
 * Public endpoint (can be called without auth, but will track userId if authenticated)
 */
router.post('/track', authenticate, trackEvent);

/**
 * GET /api/analytics/user
 * Get analytics for the authenticated user
 * Requires authentication
 */
router.get('/user', authenticate, getUserAnalytics);

/**
 * GET /api/analytics/summary
 * Get analytics summary (Admin only)
 * Requires admin authentication
 */
router.get('/summary', authenticate, requireAdmin, getAnalyticsSummary);

export default router;
