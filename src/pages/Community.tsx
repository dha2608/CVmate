import { useEffect } from 'react';
import { useCommunityStore } from '@/store/communityStore';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import CreatePost from '@/components/community/CreatePost';
import PostCard from '@/components/community/PostCard';
import { Loader2 } from 'lucide-react';

const Community = () => {
  const { user } = useAuthStore();
  const { posts, fetchPosts, isLoading } = useCommunityStore();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }
    fetchPosts();
  }, [user, navigate, fetchPosts]);

  if (!user) return null;

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
            <div className="text-center py-10">
                <Loader2 className="inline-block animate-spin h-8 w-8 text-gray-900 dark:text-gray-100" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('community.loadingFeed')}</p>
            </div>
        ) : (
            <div className="space-y-4">
                {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                ))}
                {posts.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                        <div className="w-32 h-32 mx-auto opacity-50 mb-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <MessageSquare className="w-16 h-16 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('community.noPostsYet')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{t('community.beFirstToShare')}</p>
                    </div>
                )}
            </div>
        )}
    </MainLayout>
  );
};

export default Community;
