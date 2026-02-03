import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useI18n } from '@/store/i18nStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import BookmarkButton from '@/components/BookmarkButton';
import { Bookmark, Briefcase, FileText, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const Bookmarks = () => {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { bookmarks, fetchBookmarks, removeBookmark, isLoading } = useBookmarkStore();
  const [bookmarkItems, setBookmarkItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'job' | 'article'>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookmarks();
  }, [user, navigate, fetchBookmarks]);

  useEffect(() => {
    const loadBookmarkItems = async () => {
      if (bookmarks.length === 0) {
        setBookmarkItems([]);
        setLoadingItems(false);
        return;
      }

      setLoadingItems(true);
      try {
        const items: any[] = [];
        
        for (const bookmark of bookmarks) {
          try {
            // Validate itemId - skip if it's a URL or invalid
            const itemId = bookmark.itemId;
            if (!itemId || itemId.startsWith('http://') || itemId.startsWith('https://')) {
              console.warn(`Skipping invalid bookmark itemId: ${itemId}`);
              continue;
            }

            if (bookmark.type === 'job') {
              const response = await api.getJob(itemId);
              if (response.success) {
                items.push({ ...response.data, bookmarkId: bookmark._id, bookmarkType: 'job' });
              }
            } else if (bookmark.type === 'article') {
              const response = await api.getArticle(itemId);
              if (response.success) {
                items.push({ ...response.data, bookmarkId: bookmark._id, bookmarkType: 'article' });
              }
            }
          } catch (error: any) {
            // Only log if it's not a 404 (item might have been deleted)
            if (error?.status !== 404) {
              console.error(`Failed to load ${bookmark.type} ${bookmark.itemId}:`, error);
            }
          }
        }
        
        setBookmarkItems(items);
      } catch (error) {
        console.error('Failed to load bookmark items:', error);
      } finally {
        setLoadingItems(false);
      }
    };

    loadBookmarkItems();
  }, [bookmarks]);

  const filteredItems = activeTab === 'all' 
    ? bookmarkItems 
    : bookmarkItems.filter(item => item.bookmarkType === activeTab);

  const handleRemove = async (bookmarkId: string) => {
    await removeBookmark(bookmarkId);
    setBookmarkItems(prev => prev.filter(item => item.bookmarkId !== bookmarkId));
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-4 sm:py-6 lg:py-8 px-2 sm:px-4">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Bookmark className="w-6 h-6 sm:w-8 sm:h-8 text-crimson-red dark:text-red-400" />
            Bookmarks
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Các công việc và bài viết bạn đã lưu
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'job', 'article'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={`text-xs sm:text-sm ${
                activeTab === tab
                  ? 'bg-crimson-red hover:bg-fire-red text-white'
                  : 'dark:bg-gray-700 dark:text-white dark:border-gray-600'
              }`}
            >
              {tab === 'all' ? t('common.all') : 
               tab === 'job' ? t('nav.jobs') : t('nav.blog')}
              {tab !== 'all' && (
                <span className="ml-2 bg-white/20 dark:bg-gray-600 px-1.5 py-0.5 rounded text-xs">
                  {bookmarkItems.filter(item => item.bookmarkType === tab).length}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Content */}
        {isLoading || loadingItems ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start gap-4">
                  <Skeleton variant="rectangular" width={80} height={80} className="rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="70%" height={20} />
                    <Skeleton variant="text" width="50%" height={16} />
                    <Skeleton variant="text" width="90%" height={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có bookmarks
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? 'Bắt đầu lưu các công việc và bài viết bạn quan tâm'
                : activeTab === 'job'
                ? 'Lưu các công việc bạn muốn xem lại sau'
                : 'Lưu các bài viết hữu ích để đọc sau'}
            </p>
            <Button
              onClick={() => navigate(activeTab === 'job' ? '/jobs' : '/blog')}
              className="bg-crimson-red hover:bg-fire-red text-white"
            >
              {activeTab === 'job' ? 'Khám phá Jobs' : 'Khám phá Blog'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.bookmarkId}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.bookmarkType === 'job' 
                      ? 'bg-blue-100 dark:bg-blue-900/20' 
                      : 'bg-green-100 dark:bg-green-900/20'
                  }`}>
                    {item.bookmarkType === 'job' ? (
                      <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 
                        className="text-base sm:text-lg font-bold text-gray-900 dark:text-white hover:text-crimson-red dark:hover:text-red-400 transition-colors cursor-pointer line-clamp-2"
                        onClick={() => {
                          if (item.bookmarkType === 'job') {
                            navigate('/jobs');
                          } else {
                            navigate(`/blog/${item._id}`);
                          }
                        }}
                      >
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <BookmarkButton 
                          type={item.bookmarkType} 
                          itemId={item._id || item.bookmarkId} 
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(item.bookmarkId)}
                          className="h-8 w-8 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          aria-label="Remove bookmark"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    {item.bookmarkType === 'job' ? (
                      <>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {item.company}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {item.description}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {item.category || 'Article'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item.summary || item.content?.substring(0, 150)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Bookmarks;
