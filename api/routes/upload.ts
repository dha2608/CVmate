import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/upload.js';
import { uploadAvatar, getFileAsBase64 } from '../controllers/uploadController.js';

const router = Router();

router.post('/avatar', protect, uploadSingle, uploadAvatar);
router.get('/file/:filename', getFileAsBase64);

export default router;
