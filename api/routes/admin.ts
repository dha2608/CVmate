import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  getAdminOverview,
  getUsers,
  updateUserRole,
  updateUserSubscription,
  banUser,
  unbanUser,
  getPosts,
  updatePostStatus,
  deletePost,
  getArticles,
  toggleArticlePublish,
  deleteArticle,
  getJobs,
  deleteJob,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get('/overview', getAdminOverview);

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/subscription', updateUserSubscription);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);

router.get('/posts', getPosts);
router.put('/posts/:id/status', updatePostStatus);
router.delete('/posts/:id', deletePost);

router.get('/articles', getArticles);
router.put('/articles/:id/toggle-publish', toggleArticlePublish);
router.delete('/articles/:id', deleteArticle);

router.get('/jobs', getJobs);
router.delete('/jobs/:id', deleteJob);

export default router;
