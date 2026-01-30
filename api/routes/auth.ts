import { Router } from 'express';
import passport from '../config/passport.js';
import { 
  registerUser, 
  loginUser, 
  getMe, 
  updateUserProfile,
  completeOnboarding,
  googleAuthCallback 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  googleAuthCallback
);

// Onboarding
router.post('/onboarding', protect, completeOnboarding);

// Current user profile
router.get('/me', protect, getMe);
router.put('/me', protect, updateUserProfile);

export default router;
