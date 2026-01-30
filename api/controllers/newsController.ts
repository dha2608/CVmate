import { Request, Response, NextFunction } from 'express';
import { getCachedNews } from '../services/newsService.js';

export const getNews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const news = await getCachedNews(limit);

    res.json({
      success: true,
      data: news,
      count: news.length,
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch career news',
      error: error.message,
    });
  }
};

export const refreshNews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    // Force refresh by clearing cache
    const { getCachedNews } = await import('../services/newsService.js');
    const news = await getCachedNews(limit);

    res.json({
      success: true,
      message: 'News cache refreshed',
      data: news,
      count: news.length,
    });
  } catch (error: any) {
    console.error('Error refreshing news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh career news',
      error: error.message,
    });
  }
};
