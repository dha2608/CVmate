import { Router } from 'express';
import { getNews, refreshNews } from '../controllers/newsController.js';

const router = Router();

router.get('/', getNews);
router.post('/refresh', refreshNews);

export default router;
