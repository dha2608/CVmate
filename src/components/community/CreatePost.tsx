import { useState } from 'react';
import { useCommunityStore } from '@/store/communityStore';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const CreatePost = () => {
  const { t } = useI18n();
  const toast = useToastStore();
  const { createPost } = useCommunityStore();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await createPost(content, imageUrl);
      setContent('');
      setImageUrl('');
      toast.success(t('toast.postCreated'));
    } catch (_error: any) {
      toast.error(t('toast.postFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none transition-all"
          rows={3}
          placeholder={t('community.sharePlaceholder') || 'Share your career updates or ask for CV feedback...'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
        />
        <div className="mt-2 flex items-center gap-2">
            <Input 
                placeholder={t('common.imageUrl') || 'Image URL (optional)'} 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 text-sm"
                disabled={isLoading}
            />
            <Button 
                type="submit" 
                disabled={isLoading || !content.trim()}
                className="bg-accent hover:bg-red-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.posting') || 'Posting...'}
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
