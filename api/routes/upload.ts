import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadSingle, uploadSingleCover } from '../middleware/upload.js';
import { uploadAvatar, uploadCoverPhoto, getFileAsBase64 } from '../controllers/uploadController.js';

const router = Router();

router.post('/avatar', protect, uploadSingle, uploadAvatar);
router.post('/cover-photo', protect, uploadSingleCover, uploadCoverPhoto);
router.get('/file/:filename', getFileAsBase64);

export default router;
