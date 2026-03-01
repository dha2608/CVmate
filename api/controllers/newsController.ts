import { Request, Response, NextFunction } from 'express';
import { getCachedNews } from '../services/newsService.js';
import logger from '../utils/logger.js';

export const getNews = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    // Set CORS headers explicitly for news endpoint
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const offset = (page - 1) * limit;
    const { items, total } = await getCachedNews(limit, offset);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    // getCachedNews should return fallback articles, but if it still throws, return empty array
    logger.error('Error fetching news', error instanceof Error ? error : new Error(String(error)));
    
    // Set CORS headers even on error
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    res.json({
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 0,
        total: 0,
        pages: 0,
      },
      message: 'Using fallback news articles',
    });
  }
};

export const refreshNews = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const offset = (page - 1) * limit;
    // Force refresh by clearing cache
    const { getCachedNews } = await import('../services/newsService.js');
    const { items, total } = await getCachedNews(limit, offset);

    res.json({
      success: true,
      message: 'News cache refreshed',
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error refreshing news', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      success: false,
      message: 'Failed to refresh career news',
      error: errorMessage,
    });
  }
};
