import { Router, Response, NextFunction } from 'express';
import { trackEvent, getAnalyticsSummary, getUserAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

/**
 * POST /api/analytics/track
 * Track an analytics event
 * Public endpoint (can be called without auth, but will track userId if authenticated)
 */
// Optional auth middleware for track endpoint
const optionalAuth = async (req: any, res: Response, next: NextFunction) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Try to authenticate, but don't fail if it doesn't work
    try {
      await protect(req, res, next);
    } catch {
      // Auth failed but continue anyway (public endpoint)
      next();
    }
  } else {
    // No auth token, continue as public
    next();
  }
};

router.post('/track', optionalAuth, trackEvent);

/**
 * GET /api/analytics/user
 * Get analytics for the authenticated user
 * Requires authentication
 */
router.get('/user', protect, getUserAnalytics);

/**
 * GET /api/analytics/summary
 * Get analytics summary (Admin only)
 * Requires admin authentication
 */
router.get('/summary', protect, requireAdmin, getAnalyticsSummary);

export default router;
