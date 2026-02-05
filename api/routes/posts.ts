import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createPost, getPosts, likePost, commentPost } from '../controllers/postController.js';
import { validate, createPostSchema, commentPostSchema } from '../utils/validators.js';

const router = express.Router();

router.route('/')
  .get(protect, getPosts)
  .post(protect, validate(createPostSchema), createPost);

router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, validate(commentPostSchema), commentPost);

export default router;
