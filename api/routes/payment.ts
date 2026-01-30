import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createCheckoutSession, stripeWebhook, getSubscriptionStatus, cancelSubscription } from '../controllers/paymentController.js';
import express from 'express';

const router = Router();

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/subscription-status', protect, getSubscriptionStatus);
router.post('/cancel-subscription', protect, cancelSubscription);

export default router;
