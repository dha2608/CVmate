import { Request, Response, NextFunction } from 'express';
import Article from '../models/Article.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { getHFOrThrow, resolveModel, buildCacheKey, getCachedOrRun, logAIUsage } from '../utils/aiClient.js';

export const createArticle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, content, category, image } = req.body;

    if (!title || !content) {
      handleValidationError(res, 'Title and content are required');
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

    const model = resolveModel(req, 'chat');
    const payload = { title, content: content.substring(0, 2000) };
    const cacheKey = buildCacheKey('article_seo', model, payload);
    const startedAt = Date.now();

    try {
      const aiResponse = await getCachedOrRun(cacheKey, 60 * 60 * 1000, async () => {
        const hf = getHFOrThrow();

        const completion = await hf.chatCompletion({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are an SEO expert and content strategist. Only respond with a valid JSON object and no other text.',
            },
            {
              role: 'user',
              content: `Analyze the following article content. Return a JSON object with two keys: "summary" (a professional 2-3 sentence summary optimized for click-through) and "tags" (an array of 5-8 relevant, lowercase, hyphenated SEO keywords). Content: ${content.substring(0, 2000)}`,
            },
          ],
          max_tokens: 512,
          temperature: 0.35,
        });

        const responseContent = completion.choices?.[0]?.message?.content;
        if (!responseContent) {
          throw new Error('No response from AI provider');
        }

        return JSON.parse(responseContent);
      });

      summary = (aiResponse as any).summary || content.substring(0, 150) + '...';
      tags = (aiResponse as any).tags || [];

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/articles',
        type: 'article_seo',
        model,
        durationMs,
        success: true,
      });
      } catch (error) {
        logger.error('AI summary generation error', error instanceof Error ? error : new Error(String(error)), {
          articleTitle: title,
          userId: req.user?._id,
        });
        summary = content.substring(0, 150) + '...';
        tags = ['general'];

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/articles',
        type: 'article_seo',
        model,
        durationMs,
        success: false,
        errorCode: 'SEO_ERROR',
      });
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

    sendSuccessResponse(res, article, 201);
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