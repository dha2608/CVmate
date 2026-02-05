import { Request, Response, NextFunction } from 'express';
import webPush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:support@cvmate.app';

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

export const saveSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { endpoint, keys } = req.body as {
      endpoint?: string;
      keys?: { auth?: string; p256dh?: string };
    };

    if (!endpoint || !keys?.auth || !keys?.p256dh) {
      res.status(400).json({ success: false, message: 'Invalid push subscription payload' });
      return;
    }

    await PushSubscription.updateOne(
      { endpoint },
      {
        user: userId,
        endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh,
      },
      { upsert: true },
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getVapidPublicKey = async (_req: Request, res: Response) => {
  if (!vapidPublicKey) {
    res.status(503).json({ success: false, message: 'Push notifications not configured' });
    return;
  }

  res.json({ success: true, data: { publicKey: vapidPublicKey } });
};

export const sendTestNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      res.status(503).json({ success: false, message: 'Push notifications not configured' });
      return;
    }

    const subscription = await PushSubscription.findOne({ user: userId }).sort({ createdAt: -1 });
    if (!subscription) {
      res.status(404).json({ success: false, message: 'No push subscription found' });
      return;
    }

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.auth,
        p256dh: subscription.p256dh,
      },
    };

    const payload = JSON.stringify({
      title: 'CV Mate',
      body: 'Push notifications are configured correctly 🎉',
    });

    try {
      await webPush.sendNotification(pushSubscription as any, payload);
      res.json({ success: true, message: 'Test notification sent' });
    } catch (error) {
      logger.error('Failed to send push notification', error, { userId });
      res.status(503).json({ success: false, message: 'Failed to send push notification' });
    }
  } catch (error) {
    next(error);
  }
};

