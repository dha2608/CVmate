import multer from 'multer';
import path from 'path';

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed!'));
};

export const upload = multer({
  // Use memory storage — files are uploaded to Cloudinary, not local disk
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // Default: 5MB
  },
  fileFilter,
});

export const uploadSingle = upload.single('avatar');
export const uploadSingleCover = upload.single('coverPhoto');
export const uploadPostImage = upload.single('postImage');
export const uploadMultiple = upload.array('images', 10);
