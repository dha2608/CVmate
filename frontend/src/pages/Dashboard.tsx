import { lazy, Suspense, useEffect, useMemo, useState, memo, useCallback }from 'react';
import { useNavigate }from 'react-router-dom';
import { motion }from 'framer-motion';
import { useAuthStore }from '@/store/authStore';
import { useDashboardStore }from '@/store/dashboardStore';
import { useCommunityStore }from '@/store/communityStore';
import { useBlogStore }from '@/store/blogStore';
import { useAchievementStore }from '@/store/achievementStore';
import { useI18n }from '@/store/i18nStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button }from '@/components/ui/button';
import { GlassButton }from '@/components/ui/glass-button';
import { GlassCard }from '@/components/ui/glass-card';
import { Skeleton }from '@/components/ui/skeleton';
import ActivityFeed from '@/components/ActivityFeed';
import { AchievementList }from '@/components/achievements/AchievementBadge';
import { FileText, MessageSquare, Plus, Video, TrendingUp, Search, PenTool, ExternalLink, BarChart3, Target }from 'lucide-react';

const AnalyticsChart = lazy(() => import('@/components/dashboard/AnalyticsChart'));
const AdvancedStats = lazy(() => import('@/components/dashboard/AdvancedStats'));

const QuickActionCard = memo(({ icon, title, desc, color, onClick }: any) => (
  <motion.div
    onClick={onClick}
    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col items-center text-center gap-2 ${color}dark:border-gray-700 hover:shadow-md`}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">{icon}</div>
    <div className="min-w-0 w-full">
      <h3 className="font-bold text-gray-800 dark:text-white text-xs sm:text-sm truncate">{title}</h3>
      <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 mt-0.5 line-clamp-2">{desc}</p>
    </div>
  </motion.div>
));
QuickActionCard.displayName = 'QuickActionCard';

const StatItem = memo(({ label, value, color }: any) => (
  <motion.div className="text-center" initial={{ opacity: 0, scale: 0.8 }}animate={{ opacity: 1, scale: 1 }}transition={{ duration: 0.3 }}>
    <div className={`text-2xl sm:text-3xl font-black ${color}mb-1`}>{value}</div>
    <div className="text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</div>
  </motion.div>
));
StatItem.displayName = 'StatItem';

const RecommendationCard = memo(({ image, title, author, views, desc, onClick }: any) => {
  const { t }= useI18n();
  return (
    <motion.div
      className="glass-card bg-white/5 dark:bg-gray-800/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm cursor-pointer flex gap-3 sm:gap-4 items-start group"
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
        {image ? (
          <img src={image}alt={title}className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400 dark:text-indigo-500" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm mb-1 line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{title}</h3>
        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="font-medium text-gray-700 dark:text-gray-300">{author}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
          <span>{views}</span>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{desc}</p>
        <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-rose-500 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {t('home.readMore')}<ExternalLink size={10}className="sm:w-3 sm:h-3" />
        </div>
      </div>
    </motion.div>
  );
});
RecommendationCard.displayName = 'RecommendationCard';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { t }= useI18n();

  const stats = useDashboardStore((state) => state.stats);
  const statsLoading = useDashboardStore((state) => state.isLoading);
  const articles = useBlogStore((state) => state.articles);
  const articlesLoading = useBlogStore((state) => state.isLoading);
  const achievements = useAchievementStore((state) => state.achievements);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 18) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  }, [t]);

  const userId = user?._id ?? null;
  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    const loadData = async () => {
      setIsInitialLoading(true);
      try {
        const { fetchStats: fs } = useDashboardStore.getState();
        const { fetchPosts: fp } = useCommunityStore.getState();
        const { fetchArticles: fa } = useBlogStore.getState();
        const { fetchAchievements: fach } = useAchievementStore.getState();
        await Promise.all([fs(), fp(), fa(), fach()]);
      } finally {
        if (mounted) setIsInitialLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [userId]);

  const profileProgress = useMemo(() => {
    if (!user) return 0;
    const arr = [user.onboardingCompleted ? 1 : 0, stats.resumesCount > 0 ? 1 : 0, stats.interviewsCount > 0 ? 1 : 0, stats.postsCount > 0 ? 1 : 0];
    return (arr.reduce((a, b) => a + b, 0) / arr.length) * 100;
  }, [user?.onboardingCompleted, stats.resumesCount, stats.interviewsCount, stats.postsCount]);

  const analyticsData = useMemo(
    () => [
      { label: t('dashboard.thisWeek'), value: stats.interviewsCount || 0 },
      { label: t('dashboard.lastWeek'), value: Math.max(0, (stats.interviewsCount || 0) - 2) },
      { label: t('dashboard.thisMonth'), value: stats.resumesCount || 0 },
    ],
    [t, stats.interviewsCount, stats.resumesCount]
  );

  const handleCommunityClick = useCallback(() => navigate('/community'), [navigate]);
  const handleBuilderClick = useCallback(() => navigate('/builder'), [navigate]);
  const handleInterviewClick = useCallback(() => navigate('/interview'), [navigate]);
  const handleBlogClick = useCallback(() => navigate('/blog'), [navigate]);

  if (!user) return null;

  const isLoading = isInitialLoading || statsLoading || articlesLoading;

  return (
    <MainLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }}animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-4 sm:p-6" gradient="purple">
          <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <>
                  <Skeleton className="mb-2 h-8 w-3/5" />
                  <Skeleton className="h-5 w-2/5" />
                </>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{greeting}, {user.name?.split(' ')[0]}!</h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.readyToBoost')}</p>
                </>
              )}
            </div>
            <Button variant="ghost" size="icon" className="rounded-full bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400" aria-label={t('common.search')}><Search size={18}/></Button>
          </div>
          <div onClick={handleCommunityClick}className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-600/50">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 shadow-sm border border-gray-100 dark:border-gray-600"><PenTool size={18}/></div>
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium flex-1">{t('dashboard.startPost')}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6" gradient="cyan">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide flex items-center gap-1"><Target size={14}className="text-crimson-red" />{t('dashboard.nextBestAction') || 'Next best action'}</p>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{t('dashboard.nextActionCreateCV') || 'Tạo CV đầu tiên của bạn'}</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('dashboard.nextActionCreateCVDesc') || 'Bắt đầu với template ATS-friendly và để AI tối ưu nội dung giúp bạn.'}</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex flex-col items-start">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">{t('dashboard.profileCompletion') || 'Profile completion'}</span>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-2 bg-crimson-red rounded-full" style={{ width: `${Math.round(profileProgress)}%` }}/></div>
                <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 mt-1">{Math.round(profileProgress)}%</span>
              </div>
              <GlassButton size="sm" variant="pink" onClick={handleBuilderClick}>{t('dashboard.createCV') || 'Tạo CV'}</GlassButton>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <QuickActionCard icon={<FileText className="text-blue-600" size={24}/>}title={t('dashboard.createCV')}desc={t('dashboard.atsFriendly')}color="bg-blue-50 hover:bg-blue-100/80 border-blue-100" onClick={handleBuilderClick}/>
          <QuickActionCard icon={<Video className="text-green-600" size={24}/>}title={t('dashboard.interview')}desc={t('dashboard.practiceAI')}color="bg-green-50 hover:bg-green-100/80 border-green-100" onClick={handleInterviewClick}/>
          <QuickActionCard icon={<MessageSquare className="text-orange-600" size={24}/>}title={t('dashboard.community')}desc={t('dashboard.getAdvice')}color="bg-orange-50 hover:bg-orange-100/80 border-orange-100" onClick={handleCommunityClick}/>
          <QuickActionCard icon={<Plus className="text-rose-600" size={24}/>}title={t('dashboard.article')}desc={t('dashboard.shareKnowledge')}color="bg-rose-50 hover:bg-rose-100/80 border-rose-100" onClick={handleBlogClick}/>
        </div>

        <GlassCard className="p-4 sm:p-6" gradient="pink">
          <h2 className="text-heading-3 mb-6 flex items-center gap-2"><TrendingUp size={20}className="text-crimson-red" />{t('dashboard.yourActivity')}</h2>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (<div key={i}className="text-center"><Skeleton className="mb-2 h-10 w-full rounded-lg" /><Skeleton className="mx-auto h-4 w-4/5" /></div>))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 sm:gap-6 divide-x divide-gray-100 dark:divide-gray-700">
              <StatItem label={t('dashboard.cvsCreated')}value={stats.resumesCount || 0}color="text-blue-600 dark:text-blue-400" />
              <StatItem label={t('dashboard.interviews')}value={stats.interviewsCount || 0}color="text-green-600 dark:text-green-400" />
              <StatItem label={t('dashboard.postViews')}value={stats.postsCount || 0}color="text-orange-600 dark:text-orange-400" />
            </div>
          )}
        </GlassCard>

        <ActivityFeed limit={3}/>

        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <AdvancedStats stats={stats}/>
          <AnalyticsChart
            title={t('dashboard.activityOverTime')}
            data={analyticsData}
            color="bg-blue-500"
            previousPeriod={Math.max(0, (stats.interviewsCount || 0) - 2)}
            currentPeriod={stats.interviewsCount || 0}
          />
        </Suspense>

        {articles.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{t('dashboard.recommendedForYou')}</h2>
              <Button variant="link" className="text-rose-500 p-0 h-auto font-semibold" onClick={handleBlogClick}>{t('dashboard.viewAll')}</Button>
            </div>
            {articles.slice(0, 2).map((article: any) => (
              <RecommendationCard
                key={article._id}
                image={article.image || article.coverImage}
                title={article.title}
                author={typeof article.author === 'object' ? article.author?.name || 'Author' : 'Author'}
                views={article.views ? `${article.views}${t('blog.views')}` : t('blog.new')}
                desc={article.summary || article.content?.substring(0, 100) + '...'}
                onClick={() => navigate(`/blog/${article._id}`)}
              />
            ))}
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default memo(Dashboard);
