import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateTwoFactorSecret, enableTwoFactor, disableTwoFactor } from '../controllers/twoFactorController.js';

const router = Router();

// Generate secret + QR code for authenticator apps
router.post('/setup', protect, generateTwoFactorSecret);

// Confirm and enable 2FA
router.post('/enable', protect, enableTwoFactor);

// Disable 2FA
router.post('/disable', protect, disableTwoFactor);

export default router;

