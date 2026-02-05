import { Router } from 'express';
import passport from '../config/passport.js';
import { 
  registerUser, 
  loginUser, 
  getMe, 
  updateUserProfile,
  completeOnboarding,
  googleAuthCallback,
  getPublicProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate, loginSchema, registerSchema, updateProfileSchema, onboardingSchema } from '../utils/validators.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback', 
    passport.authenticate('google', { session: false }),
    googleAuthCallback
  );
} else {
  // Fallback route nếu Google OAuth chưa được config
  router.get('/google', (req, res) => {
    res.status(503).json({ 
      success: false, 
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.' 
    });
  });
}

// Onboarding
router.post('/onboarding', protect, validate(onboardingSchema), completeOnboarding);

// Current user profile
router.get('/me', protect, getMe);
router.put('/me', protect, validate(updateProfileSchema), updateUserProfile);

// Public profile
router.get('/users/:id/public', getPublicProfile);

export default router;
