import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createCheckoutSession,
  stripeWebhook,
  verifyCheckoutSession,
  getSubscriptionStatus,
  cancelSubscription,
  createPayPalOrder,
  capturePayPalPayment,
  switchPlan,
} from '../controllers/paymentController.js';
import { validate, createCheckoutSchema, paypalOrderSchema } from '../utils/validators.js';
import express from 'express';

const router = Router();

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.post(
  '/create-checkout-session',
  protect,
  validate(createCheckoutSchema),
  createCheckoutSession
);
router.post('/verify-checkout-session', protect, verifyCheckoutSession);
router.get('/subscription-status', protect, getSubscriptionStatus);
router.post('/cancel-subscription', protect, cancelSubscription);
router.post('/switch-plan', protect, switchPlan);
router.post('/paypal/create-order', protect, validate(paypalOrderSchema), createPayPalOrder);
router.post('/paypal/capture', protect, capturePayPalPayment);

export default router;
