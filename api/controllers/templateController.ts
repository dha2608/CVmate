import { Request, Response, NextFunction } from 'express';
import ResumeTemplate from '../models/ResumeTemplate.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getResumeTemplates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isPremiumUser = req.user?.subscription?.plan === 'premium' && req.user.subscription.status === 'active';
    const includePremium = isPremiumUser;

    const query: Record<string, unknown> = {};
    if (!includePremium) {
      query.isPremium = false;
    }

    const templates = await ResumeTemplate.find(query)
      .sort({ isPremium: 1, createdAt: 1 })
      .select('key name description previewImage layout defaultTheme tags isPremium');

    res.json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

export const seedDefaultTemplates = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const defaults = [
      {
        key: 'classic-single-column',
        name: 'Classic Single Column',
        description: 'Clean, ATS-friendly layout with strong hierarchy for general roles.',
        layout: 'standard',
        defaultTheme: { color: '#0F172A', font: 'Inter' },
        tags: ['general', 'junior', 'mid-level'],
        isPremium: false,
      },
      {
        key: 'modern-two-column',
        name: 'Modern Two Column',
        description: 'Bold two-column layout optimized for designers and tech roles.',
        layout: 'two-column',
        defaultTheme: { color: '#4F46E5', font: 'Inter' },
        tags: ['tech', 'designer', 'modern'],
        isPremium: false,
      },
      {
        key: 'minimalist-focus',
        name: 'Minimalist Focus',
        description: 'Ultra-clean layout with strong typography, ideal for senior roles.',
        layout: 'minimalist',
        defaultTheme: { color: '#111827', font: 'Inter' },
        tags: ['senior', 'executive', 'minimal'],
        isPremium: true,
      },
    ];

    for (const tpl of defaults) {
      await ResumeTemplate.updateOne(
        { key: tpl.key },
        { $setOnInsert: tpl },
        { upsert: true },
      );
    }

    res.json({ success: true, message: 'Default templates seeded' });
  } catch (error) {
    next(error);
  }
};

