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
import {
  validate,
  createArticleSchema,
  updateArticleSchema,
  articleCommentSchema,
} from '../utils/validators.js';

const router = express.Router();

router
  .route('/')
  .get(getArticles)
  .post(protect, requireAdmin, validate(createArticleSchema), createArticle);

router
  .route('/:id')
  .get(getArticleById)
  .put(protect, requireAdmin, validate(updateArticleSchema), updateArticle)
  .delete(protect, requireAdmin, deleteArticle);

router.post('/:id/like', protect, likeArticle);
router.post('/:id/comments', protect, validate(articleCommentSchema), addArticleComment);
router.delete('/:id/comments/:commentId', protect, deleteArticleComment);

export default router;
