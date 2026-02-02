import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useToastStore } from '@/store/toastStore';
import { useI18n } from '@/store/i18nStore';

interface BookmarkButtonProps {
  type: 'job' | 'article';
  itemId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline';
}

const BookmarkButton = ({ type, itemId, size = 'sm', variant = 'ghost' }: BookmarkButtonProps) => {
  const { isBookmarked, addBookmark, removeBookmark, getBookmarkId } = useBookmarkStore();
  const toast = useToastStore();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  
  const bookmarked = isBookmarked(type, itemId);
  const bookmarkId = getBookmarkId(type, itemId);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (bookmarked && bookmarkId) {
        const success = await removeBookmark(bookmarkId);
        if (success) {
          toast.success(type === 'job' ? 'Đã bỏ lưu công việc' : 'Đã bỏ lưu bài viết');
        }
      } else {
        const success = await addBookmark(type, itemId);
        if (success) {
          toast.success(type === 'job' ? 'Đã lưu công việc' : 'Đã lưu bài viết');
        }
      }
    } catch (error: any) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleToggle}
      disabled={isLoading}
      className={sizeClasses[size]}
      aria-label={bookmarked ? 'Bỏ lưu' : 'Lưu'}
      title={bookmarked ? 'Bỏ lưu' : 'Lưu'}
    >
      {bookmarked ? (
        <BookmarkCheck 
          size={iconSizes[size]} 
          className="text-yellow-500 dark:text-yellow-400 fill-current" 
        />
      ) : (
        <Bookmark 
          size={iconSizes[size]} 
          className="text-gray-500 dark:text-gray-400" 
        />
      )}
    </Button>
  );
};

export default BookmarkButton;
