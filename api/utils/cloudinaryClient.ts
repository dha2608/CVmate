import { v2 as cloudinary } from 'cloudinary';

// Configured from env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
const isConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

/**
 * Upload a buffer to Cloudinary.
 * @param buffer  — file buffer from multer memoryStorage
 * @param folder  — subfolder inside cvmate/ (e.g. 'avatars', 'covers', 'posts')
 * @param options — optional publicId and transformation overrides
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  options: { publicId?: string; transformation?: object[] } = {}
): Promise<CloudinaryUploadResult> => {
  if (!isConfigured) {
    return Promise.reject(
      new Error(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env vars.'
      )
    );
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `cvmate/${folder}`,
        public_id: options.publicId,
        transformation: options.transformation ?? [{ quality: 'auto', fetch_format: 'auto' }],
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as CloudinaryUploadResult);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete an asset from Cloudinary by public_id.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
