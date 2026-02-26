import { useState, useRef } from 'react';
import { useCommunityStore } from '@/store/communityStore';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import { api } from '@/lib/utils';

const CreatePost = () => {
  const { t } = useI18n();
  const toast = useToastStore();
  const { createPost } = useCommunityStore();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('common.invalidImageType') || 'Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('common.imageTooLarge') || 'Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !selectedImage) {
      toast.error(t('community.contentOrImageRequired') || 'Please add content or an image');
      return;
    }

    let finalImageUrl: string | undefined;

    try {
      if (selectedImage) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('postImage', selectedImage);

        const uploadResponse = await api.upload.uploadPostImage(formData);
        if (!uploadResponse.success || !uploadResponse.data?.url) {
          throw new Error(uploadResponse.message || 'Failed to upload image');
        }
        finalImageUrl = uploadResponse.data.url;
      }

      setIsLoading(true);
      await createPost(content, finalImageUrl);

      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success(t('toast.postCreated'));
    } catch (error: any) {
      toast.error(error.message || t('toast.postFailed'));
    } finally {
      setIsLoading(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="glass-card bg-white/90 dark:bg-gray-800/90 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-red focus:border-transparent resize-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          rows={4}
          placeholder={t('community.sharePlaceholder') || 'Share your career updates or ask for CV feedback...'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading || isUploadingImage}
        />

        {imagePreview && (
          <div className="mt-3 relative">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full max-h-64 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="post-image-upload"
              disabled={isLoading || isUploadingImage}
            />
            <label
              htmlFor="post-image-upload"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer transition-all ${
                isLoading || isUploadingImage
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <ImageIcon size={18} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {selectedImage ? (t('common.imageSelected') || 'Image selected') : (t('common.uploadImage') || 'Upload image')}
              </span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isUploadingImage || (!content.trim() && !selectedImage)}
            className="bg-crimson-red hover:bg-fire-red text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoading || isUploadingImage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isUploadingImage ? (t('common.uploading') || 'Uploading...') : (t('common.posting') || 'Posting...')}
              </>
            ) : (
              t('common.post') || 'Post'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
