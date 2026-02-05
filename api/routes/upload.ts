import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadSingle, uploadSingleCover, uploadPostImage } from '../middleware/upload.js';
import { uploadAvatar, uploadCoverPhoto, uploadPostImage as uploadPostImageController, getFileAsBase64 } from '../controllers/uploadController.js';

const router = Router();

router.post('/avatar', protect, uploadSingle, uploadAvatar);
router.post('/cover-photo', protect, uploadSingleCover, uploadCoverPhoto);
router.post('/post-image', protect, uploadPostImage, uploadPostImageController);
router.get('/file/:filename', getFileAsBase64);

export default router;
