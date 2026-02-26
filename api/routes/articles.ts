import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { createArticle, getArticles, getArticleById, updateArticle, deleteArticle } from '../controllers/articleController.js';

const router = express.Router();

router.route('/')
  .get(getArticles)
  .post(protect, requireAdmin, createArticle);

router.route('/:id')
  .get(getArticleById)
  .put(protect, requireAdmin, updateArticle)
  .delete(protect, requireAdmin, deleteArticle);

export default router;
