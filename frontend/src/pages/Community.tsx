import { useEffect } from 'react';
import { useCommunityStore } from '@/store/communityStore';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import CreatePost from '@/components/community/CreatePost';
import PostCard from '@/components/community/PostCard';
import VirtualList from '@/components/VirtualList';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/ui/glass-card';
import { Loader2, MessageSquare } from 'lucide-react';

const Community = () => {
  const { user } = useAuthStore();
  const { posts, fetchPosts, isLoading } = useCommunityStore();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    // Removed auto-reload - posts will refresh when user interacts (like, comment, create new post)
  }, [fetchPosts]);

  if (!user) {return null;}

  return (
    <MainLayout>
        {/* Sort / Filter Bar */}
        <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
                <div className="h-[1px] bg-gray-300 dark:bg-gray-600 w-full flex-grow"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('community.sortBy')} <span className="font-bold text-gray-700 dark:text-gray-300 cursor-pointer">{t('community.top')}</span>
                </span>
            </div>
        </div>

        <CreatePost />

        {isLoading ? (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <GlassCard key={i} className="p-4 sm:p-6" gradient="purple">
                        <div className="flex items-start gap-3 sm:gap-4 mb-4">
                            <Skeleton variant="circular" width={40} height={40} />
                            <div className="flex-1 space-y-2">
                                <Skeleton variant="text" width="40%" height={20} />
                                <Skeleton variant="text" width="20%" height={16} />
                            </div>
                        </div>
                        <Skeleton variant="text" width="100%" height={16} className="mb-2" />
                        <Skeleton variant="text" width="90%" height={16} className="mb-2" />
                        <Skeleton variant="text" width="70%" height={16} />
                        <div className="flex items-center gap-4 mt-4">
                            <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
                            <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
                        </div>
                    </GlassCard>
                ))}
            </div>
        ) : (
            <div className="space-y-4 animate-fade-in overflow-hidden">
                <VirtualList
                  items={posts}
                  itemHeight={220}
                  height={600}
                  getItemKey={(post) => post._id}
                  renderItem={(post) => (
                    <PostCard  post={post} />
                  )}
                />
                {posts.length === 0 && (
                    <GlassCard className="p-6 sm:p-8 text-center" gradient="cyan">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto opacity-50 mb-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">{t('community.noPostsYet')}</h3>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t('community.beFirstToShare')}</p>
                    </GlassCard>
                )}
            </div>
        )}
    </MainLayout>
  );
};

export default Community;
