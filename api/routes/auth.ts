import { Router } from 'express';
import { registerUser, loginUser, getMe, updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Current user profile
router.get('/me', protect, getMe);
router.put('/me', protect, updateUserProfile);

export default router;
