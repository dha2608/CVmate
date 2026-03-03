import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPost,
  getPosts,
  likePost,
  commentPost,
  likeComment,
  updateComment,
  deleteComment,
  deletePost,
  updatePost,
} from '../controllers/postController.js';
import {
  validate,
  createPostSchema,
  commentPostSchema,
  updatePostSchema,
} from '../utils/validators.js';

const router = express.Router();

router.route('/').get(protect, getPosts).post(protect, validate(createPostSchema), createPost);

router.put('/:id', protect, validate(updatePostSchema), updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, validate(commentPostSchema), commentPost);
router.put('/:id/comment/:commentId/like', protect, likeComment);
router.put('/:id/comment/:commentId', protect, updateComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);

export default router;
