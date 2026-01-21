import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createArticle, getArticles, getArticleById } from '../controllers/articleController.js';

const router = express.Router();

router.route('/')
  .get(getArticles)
  .post(protect, createArticle);

router.route('/:id')
  .get(getArticleById);

export default router;
