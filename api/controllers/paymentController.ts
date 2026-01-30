import { Response, NextFunction } from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Tạo checkout session cho Premium subscription
export const createCheckoutSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      res.status(503).json({ success: false, message: 'Payment service is not configured' });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Tạo hoặc lấy Stripe customer
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });
      customerId = customer.id;
      user.subscription = user.subscription || { plan: 'free', status: 'active' };
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // Tạo checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'CV Mate Premium',
              description: 'Unlimited AI features, priority support, and more',
            },
            unit_amount: 999, // $9.99
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`,
      metadata: {
        userId: user._id.toString(),
      },
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create checkout session' });
  }
};

// Webhook handler cho Stripe events
export const stripeWebhook = async (req: any, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            
            user.subscription = {
              plan: 'premium',
              status: 'active',
              startDate: new Date(),
              endDate: new Date(subscription.current_period_end * 1000),
              paymentMethod: 'card',
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
            };
            await user.save();
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
        if (user) {
          if (subscription.status === 'active') {
            user.subscription = user.subscription || { plan: 'free', status: 'active' };
            user.subscription.status = 'active';
            user.subscription.endDate = new Date(subscription.current_period_end * 1000);
          } else {
            user.subscription = user.subscription || { plan: 'free', status: 'active' };
            user.subscription.status = 'cancelled';
            user.subscription.plan = 'free';
          }
          await user.save();
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Lấy subscription status
export const getSubscriptionStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const subscription = user.subscription || { plan: 'free', status: 'active' };

    // Check if premium subscription is expired
    if (subscription.plan === 'premium' && subscription.endDate) {
      if (new Date() > subscription.endDate) {
        subscription.status = 'expired';
        subscription.plan = 'free';
        await user.save();
      }
    }

    res.json({
      success: true,
      data: {
        plan: subscription.plan,
        status: subscription.status,
        endDate: subscription.endDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cancel subscription
export const cancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      res.status(503).json({ success: false, message: 'Payment service is not configured' });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user || !user.subscription?.stripeSubscriptionId) {
      res.status(404).json({ success: false, message: 'No active subscription found' });
      return;
    }

    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    user.subscription.status = 'cancelled';
    await user.save();

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to cancel subscription' });
  }
};
