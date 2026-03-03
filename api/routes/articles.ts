import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  likeArticle,
  addArticleComment,
  deleteArticleComment,
} from '../controllers/articleController.js';

const router = express.Router();

router.route('/').get(getArticles).post(protect, requireAdmin, createArticle);

router
  .route('/:id')
  .get(getArticleById)
  .put(protect, requireAdmin, updateArticle)
  .delete(protect, requireAdmin, deleteArticle);

router.post('/:id/like', protect, likeArticle);
router.post('/:id/comments', protect, addArticleComment);
router.delete('/:id/comments/:commentId', protect, deleteArticleComment);

export default router;
