import { useEffect, useRef, useCallback, useState } from 'react';
import { useCommunityStore } from '@/store/communityStore';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import MainLayout from '@/components/layout/MainLayout';
import CreatePost from '@/components/community/CreatePost';
import PostCard from '@/components/community/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Loader2, Flame, Clock, TrendingUp, Search, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'new' as const, icon: Clock, labelKey: 'community.new' },
  { value: 'hot' as const, icon: Flame, labelKey: 'community.hot' },
  { value: 'top' as const, icon: TrendingUp, labelKey: 'community.top' },
];

const Community = () => {
  const { user } = useAuthStore();
  const {
    posts,
    fetchPosts,
    loadMore,
    isLoading,
    isLoadingMore,
    hasMore,
    sort,
    setSort,
    search,
    setSearch,
  } = useCommunityStore();
  const { t } = useI18n();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        setSearch(value);
      }, 400);
    },
    [setSearch]
  );

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setSearch('');
  }, [setSearch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Infinite scroll with IntersectionObserver
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry?.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoadingMore, isLoading, loadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleObserver]);

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      {/* Search + Sort */}
      <div className="space-y-3 mb-6">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('common.search') + '...'}
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 shadow-sm"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Tabs */}
        <div className="flex items-center gap-2">
          {SORT_OPTIONS.map(({ value, icon: Icon, labelKey }) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                sort === value
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      <CreatePost />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
            >
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
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}

          {posts.length === 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 text-center rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto opacity-50 mb-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('community.noPostsYet')}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                {t('community.beFirstToShare')}
              </p>
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="py-4 flex justify-center">
            {isLoadingMore && <Loader2 className="w-6 h-6 animate-spin text-gray-400" />}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Community;
