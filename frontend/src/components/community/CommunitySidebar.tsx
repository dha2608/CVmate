import { memo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCommunityStore } from '@/store/communityStore';
import { useI18n } from '@/store/i18nStore';
import { useNavigate } from 'react-router-dom';
import { UsersRound, TrendingUp, Feather, Heart, MessageCircleMore } from 'lucide-react';

const resolveAssetUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

const CommunitySidebar = memo(() => {
  const { user } = useAuthStore();
  const { posts } = useCommunityStore();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Get top 3 posts by likes count
  const trendingPosts = [...posts]
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 3);

  return (
    <div className="space-y-4 sticky top-20">
      {/* Mini Profile Card */}
      {user && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden cursor-pointer flex-shrink-0"
              onClick={() => navigate('/profile')}
            >
              {user.avatar ? (
                <img
                  src={resolveAssetUrl(user.avatar)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.headline || user.currentRole || ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trending Posts */}
      {trendingPosts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-crimson-red" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('community.top')}
            </h3>
          </div>
          <div className="space-y-3">
            {trendingPosts.map((post, idx) => (
              <div
                key={post._id}
                className="group cursor-pointer"
                onClick={() => {
                  const el = document.getElementById(`post-${post._id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.content?.slice(0, 80)}
                      {(post.content?.length || 0) > 80 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {post.likes?.length || 0}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MessageCircleMore className="w-3 h-3" /> {post.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Guidelines */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Feather className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('community.guidelines') || 'Community Guidelines'}
          </h3>
        </div>
        <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">•</span>
            {t('community.guidelineRespect') || 'Be respectful and professional'}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            {t('community.guidelineShare') || 'Share knowledge and experiences'}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">•</span>
            {t('community.guidelineSupport') || 'Support and encourage others'}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            {t('community.guidelineNoSpam') || 'No spam or self-promotion'}
          </li>
        </ul>
      </div>

      {/* Community Stats */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <UsersRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
            CVmate Community
          </h3>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          {t('community.joinDescription') ||
            'Connect with professionals, share experiences, and grow your career together.'}
        </p>
      </div>
    </div>
  );
});

CommunitySidebar.displayName = 'CommunitySidebar';

export default CommunitySidebar;
