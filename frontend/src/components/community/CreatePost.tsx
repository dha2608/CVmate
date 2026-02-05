import { useState, useRef } from 'react';
import { useCommunityStore } from '@/store/communityStore';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import { api } from '@/lib/utils';

const CreatePost = () => {
  const { t } = useI18n();
  const toast = useToastStore();
  const { createPost } = useCommunityStore();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('common.invalidImageType') || 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('common.imageTooLarge') || 'Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setImageUrl(''); // Clear URL input when file is selected

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('postImage', selectedImage);

      const response = await api.upload.uploadPostImage(formData);
      
      if (response.success && response.data?.url) {
        setImageUrl(response.data.url);
        toast.success(t('common.imageUploaded') || 'Image uploaded successfully');
      } else {
        throw new Error(response.message || 'Failed to upload image');
      }
    } catch (error: any) {
      toast.error(error.message || t('common.imageUploadFailed') || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) {
      toast.error(t('community.contentOrImageRequired') || 'Please add content or an image');
      return;
    }

    // If image is selected but not uploaded yet, upload it first
    if (selectedImage && !imageUrl) {
      await handleUploadImage();
      // Wait a bit for the state to update
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsLoading(true);
    try {
      await createPost(content, imageUrl);
      setContent('');
      setImageUrl('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success(t('toast.postCreated'));
    } catch (error: any) {
      toast.error(error.message || t('toast.postFailed'));
    } finally {
      setIsLoading(false);
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
        
        {/* Image Preview */}
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
          {/* Image Upload Button */}
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
                {selectedImage ? t('common.imageSelected') || 'Image Selected' : t('common.uploadImage') || 'Upload Image'}
              </span>
            </label>

            {/* URL Input (fallback) */}
            <Input 
              placeholder={t('common.imageUrl') || 'Or paste image URL'} 
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                if (e.target.value) {
                  setSelectedImage(null);
                  setImagePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }
              }}
              className="flex-1 text-sm max-w-xs"
              disabled={isLoading || isUploadingImage || !!selectedImage}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading || isUploadingImage || (!content.trim() && !imageUrl && !selectedImage)}
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
