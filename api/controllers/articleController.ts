import { Request, Response, NextFunction } from 'express';
import Article from '../models/Article.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const createArticle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, content, category, image } = req.body;

    // AI Generate Summary
    let summary = '';
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: `Summarize this article in 3 lines: ${content.substring(0, 1000)}` }],
            model: "gpt-3.5-turbo",
        });
        summary = completion.choices[0].message.content || '';
    } catch (e) {
        console.error("AI Summary failed", e);
        summary = content.substring(0, 150) + '...';
    }

    const article = await Article.create({
      title,
      content,
      category,
      summary,
      image,
      author: req.user._id
    });

    res.status(201).json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

export const getArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
};

export const getArticleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};
