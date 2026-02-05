import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { saveSubscription, getVapidPublicKey, sendTestNotification } from '../controllers/pushController.js';

const router = Router();

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', protect, saveSubscription);
router.post('/test', protect, sendTestNotification);

export default router;

