import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import Article from '../models/Article.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
};

export const createArticle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, content, category, image } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required' });
      return;
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let summary = '';
    let tags: string[] = [];

    const openai = getOpenAIClient();
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an SEO expert. Analyze the article content provided.',
            },
            {
              role: 'user',
              content: `Analyze the following article content. Return a JSON object with two keys: "summary" (a professional 3-sentence summary) and "tags" (an array of 5 relevant keywords). Content: ${content.substring(0, 2000)}`,
            },
          ],
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          response_format: { type: 'json_object' },
        });

        const responseContent = completion.choices[0].message.content;
        if (responseContent) {
          const aiResponse = JSON.parse(responseContent);
          summary = aiResponse.summary || content.substring(0, 150) + '...';
          tags = aiResponse.tags || [];
        } else {
          summary = content.substring(0, 150) + '...';
          tags = ['general'];
        }
      } catch (error) {
        logger.error('OpenAI summary generation error', error instanceof Error ? error : new Error(String(error)), {
          articleTitle: title,
          userId: req.user?._id,
        });
        summary = content.substring(0, 150) + '...';
        tags = ['general'];
      }
    } else {
      summary = content.substring(0, 150) + '...';
      tags = ['general'];
    }

    const article = await Article.create({
      author: req.user?._id,
      title,
      slug,
      content,
      category,
      summary,
      tags,
      image,
      coverImage: image,
      isPublished: true,
    });

    res.status(201).json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

export const getArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const skip = (page - 1) * limit;
    const { search, category } = req.query;

    const query: {
      $or?: Array<{ title?: { $regex: string; $options: string }; summary?: { $regex: string; $options: string } }>;
      category?: string;
    } = {};

    if (search) {
      const searchStr = Array.isArray(search) ? search[0] : search;
      const searchValue = typeof searchStr === 'string' ? searchStr : String(searchStr);
      query.$or = [
        { title: { $regex: searchValue, $options: 'i' } },
        { summary: { $regex: searchValue, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      const categoryStr = Array.isArray(category) ? category[0] : category;
      query.category = typeof categoryStr === 'string' ? categoryStr : String(categoryStr);
    }

    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('author', 'name avatar bio')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Article.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const article = await Article.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name avatar bio role');

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

export const updateArticle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    if (article.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to update this article' });
      return;
    }

    const updatedArticle = await Article.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updatedArticle });
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    if (article.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to delete this article' });
      return;
    }

    await article.deleteOne();

    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    next(error);
  }
};