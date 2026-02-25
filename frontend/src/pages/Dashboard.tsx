import { lazy, Suspense, useEffect, useState, useMemo, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useCommunityStore } from '@/store/communityStore';
import { useBlogStore } from '@/store/blogStore';
import { useAchievementStore } from '@/store/achievementStore';
import { useI18n } from '@/store/i18nStore';
import { logger } from '@/lib/logger';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import ActivityFeed from '@/components/ActivityFeed';
import { AchievementList } from '@/components/achievements/AchievementBadge';
import { 
    FileText, 
    MessageSquare, 
    Plus, 
    Video, 
    TrendingUp,
    Search,
    PenTool,
    ExternalLink,
    BarChart3,
    Target
} from 'lucide-react';

const QuickActionCard = memo(({ icon, title, desc, color, onClick }: any) => (
   <motion.div 
      onClick={onClick}
      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col items-center text-center gap-2 ${color} dark:border-gray-700 hover:shadow-md`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
   >
      <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
         {icon}
      </div>
      <div className="min-w-0 w-full">
         <h3 className="font-bold text-gray-800 dark:text-white text-xs sm:text-sm truncate">{title}</h3>
         <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{desc}</p>
      </div>
   </motion.div>
));
QuickActionCard.displayName = 'QuickActionCard';

const StatItem = memo(({ label, value, color }: any) => (
   <motion.div 
      className="text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
   >
      <div className={`text-2xl sm:text-3xl font-black ${color} mb-1`}>{value}</div>
      <div className="text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</div>
   </motion.div>
));
StatItem.displayName = 'StatItem';

const RecommendationCard = memo(({ image, title, author, views, desc, onClick }: any) => {
  const { t } = useI18n();
  
  return (
    <motion.div 
      className="glass-card bg-white/5 dark:bg-gray-800/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm cursor-pointer flex gap-3 sm:gap-4 items-start group"
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
         {image ? (
           <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
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
           {t('home.readMore')} <ExternalLink size={10} className="sm:w-3 sm:h-3" />
         </div>
      </div>
    </motion.div>
  );
});
RecommendationCard.displayName = 'RecommendationCard';

// Lazy load heavy dashboard modules
const AnalyticsChart = lazy(() => import('@/components/dashboard/AnalyticsChart'));
const AdvancedStats = lazy(() => import('@/components/dashboard/AdvancedStats'));

const DashboardModuleLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/60 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/50 rounded-xl p-4">
          <Skeleton className="h-5 w-2/3 mb-3" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="bg-white/60 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/50 rounded-xl p-4">
          <Skeleton className="h-5 w-1/2 mb-3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    }
  >
    {children}
  </Suspense>
);

const Dashboard = () => {
  const user = useAuthStore(state => state.user);
  const { stats, fetchStats, isLoading: statsLoading } = useDashboardStore(state => ({
    stats: state.stats,
    fetchStats: state.fetchStats,
    isLoading: state.isLoading
  }));
  const { fetchPosts } = useCommunityStore(state => ({
    fetchPosts: state.fetchPosts
  }));
  const { articles, fetchArticles, isLoading: articlesLoading } = useBlogStore(state => ({
    articles: state.articles,
    fetchArticles: state.fetchArticles,
    isLoading: state.isLoading
  }));
  const { achievements, fetchAchievements } = useAchievementStore(state => ({
    achievements: state.achievements,
    fetchAchievements: state.fetchAchievements
  }));
  
  const { t } = useI18n();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const hour = new Date().getHours();
    if (hour < 12) {setGreeting(t('dashboard.goodMorning'));}
    else if (hour < 18) {setGreeting(t('dashboard.goodAfternoon'));}
    else {setGreeting(t('dashboard.goodEvening'));}

    const loadData = async () => {
      const start = performance.now();
      setIsInitialLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchPosts(),
          fetchArticles(),
          fetchAchievements()
        ]);
        const duration = Math.round(performance.now() - start);
        logger.info('dashboard_loaded', { durationMs: duration });
      } catch (error) {
        logger.error('dashboard_load_error', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [user, navigate, t, fetchStats, fetchPosts, fetchArticles, fetchAchievements]);

  const profileProgress = useMemo(() => {
    if (!user) return 0;
    const profileSegments = [
      user.onboardingCompleted ? 1 : 0,
      stats.resumesCount > 0 ? 1 : 0,
      stats.interviewsCount > 0 ? 1 : 0,
      stats.postsCount > 0 ? 1 : 0,
    ];
    return (profileSegments.reduce((sum, v) => sum + v, 0) / profileSegments.length) * 100;
  }, [user?.onboardingCompleted, stats.resumesCount, stats.interviewsCount, stats.postsCount]);

  const nextAction = useMemo(() => {
    if (!user) return null;
    if (!user.onboardingCompleted) {
      return {
        title: t('dashboard.nextActionOnboarding') || 'Hoàn thành onboarding để cá nhân hoá trải nghiệm',
        desc:
          t('dashboard.nextActionOnboardingDesc') ||
          'Chọn mục tiêu nghề nghiệp để chúng tôi gợi ý CV, interview và jobs phù hợp.',
        cta: t('dashboard.completeOnboarding') || 'Hoàn thành onboarding',
        href: '/onboarding',
      };
    }
    if (stats.resumesCount === 0) {
      return {
        title: t('dashboard.nextActionCreateCV') || 'Tạo CV đầu tiên của bạn',
        desc:
          t('dashboard.nextActionCreateCVDesc') ||
          'Bắt đầu với template ATS-friendly và để AI tối ưu nội dung giúp bạn.',
        cta: t('dashboard.createCV') || 'Tạo CV',
        href: '/builder',
      };
    }
    if (stats.interviewsCount === 0) {
      return {
        title: t('dashboard.nextActionInterview') || 'Luyện phỏng vấn với AI',
        desc:
          t('dashboard.nextActionInterviewDesc') ||
          'Chọn một persona phù hợp và luyện trả lời các câu hỏi phỏng vấn thực tế.',
        cta: t('dashboard.startInterview') || 'Bắt đầu interview',
        href: '/interview',
      };
    }
    return {
      title: t('dashboard.nextActionJobs') || 'Khám phá các cơ hội việc làm phù hợp',
      desc:
        t('dashboard.nextActionJobsDesc') ||
        'Dùng CV đã tối ưu để apply vào các job đang tuyển dụng.',
      cta: t('dashboard.viewJobs') || 'Xem jobs',
      href: '/jobs',
    };
  }, [user?.onboardingCompleted, stats.resumesCount, stats.interviewsCount, t]);

  const handleCommunityClick = useCallback(() => navigate('/community'), [navigate]);
  const handleBuilderClick = useCallback(() => navigate('/builder'), [navigate]);
  const handleInterviewClick = useCallback(() => navigate('/interview'), [navigate]);
  const handleBlogClick = useCallback(() => navigate('/blog'), [navigate]);

  if (!user) {return null;}

  const isLoading = isInitialLoading || statsLoading || articlesLoading;

  return (
    <MainLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
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
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                        {greeting}, {user.name.split(' ')[0]}!
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.readyToBoost')}</p>
                    </>
                  )}
               </div>
               <Button variant="ghost" size="icon" className="rounded-full bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex-shrink-0">
                  <Search size={18} className="sm:w-5 sm:h-5" />
               </Button>
            </div>

            <div 
               onClick={handleCommunityClick}
               className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50"
            >
               <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 shadow-sm border border-gray-100 dark:border-gray-600 flex-shrink-0">
                  <PenTool size={18} />
               </div>
               <span className="text-gray-500 dark:text-gray-400 text-sm font-medium flex-1">{t('dashboard.startPost')}</span>
            </div>
         </GlassCard>

         {nextAction && (
           <GlassCard className="p-4 sm:p-6" gradient="cyan">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
               <div className="space-y-1">
                 <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide flex items-center gap-1">
                   <Target size={14} className="text-crimson-red dark:text-red-400" />
                   {t('dashboard.nextBestAction') || 'Next best action'}
                 </p>
                 <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                   {nextAction.title}
                 </h2>
                 <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xl">
                   {nextAction.desc}
                 </p>
               </div>
               <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="flex flex-col items-start">
                   <span className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                     {t('dashboard.profileCompletion') || 'Profile completion'}
                   </span>
                   <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                     <div
                       className="h-2 bg-crimson-red dark:bg-red-500 rounded-full transition-all duration-500"
                       style={{ width: `${Math.min(100, Math.round(profileProgress))}%` }}
                     />
                   </div>
                   <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 mt-1">
                     {Math.round(profileProgress)}%
                   </span>
                 </div>
                 <GlassButton
                   size="sm"
                   variant="pink"
                   className="whitespace-nowrap"
                   onClick={() => navigate(nextAction.href)}
                 >
                   {nextAction.cta}
                 </GlassButton>
               </div>
             </div>
           </GlassCard>
         )}

         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <QuickActionCard 
               icon={<FileText className="text-blue-600" size={24} />}
               title={t('dashboard.createCV')}
               desc={t('dashboard.atsFriendly')}
               color="bg-blue-50 hover:bg-blue-100/80 border-blue-100"
               onClick={handleBuilderClick}
            />
            <QuickActionCard 
               icon={<Video className="text-green-600" size={24} />}
               title={t('dashboard.interview')}
               desc={t('dashboard.practiceAI')}
               color="bg-green-50 hover:bg-green-100/80 border-green-100"
               onClick={handleInterviewClick}
            />
            <QuickActionCard 
               icon={<MessageSquare className="text-orange-600" size={24} />}
               title={t('dashboard.community')}
               desc={t('dashboard.getAdvice')}
               color="bg-orange-50 hover:bg-orange-100/80 border-orange-100"
               onClick={handleCommunityClick}
            />
            <QuickActionCard 
               icon={<Plus className="text-rose-600" size={24} />}
               title={t('dashboard.article')}
               desc={t('dashboard.shareKnowledge')}
               color="bg-rose-50 hover:bg-rose-100/80 border-rose-100"
               onClick={handleBlogClick}
            />
         </div>

         <GlassCard className="p-4 sm:p-6" gradient="pink">
            <h2 className="text-heading-3 mb-6 flex items-center gap-2">
               <TrendingUp size={20} className="text-crimson-red dark:text-red-400" />
               {t('dashboard.yourActivity')}
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="mb-2 h-10 w-full rounded-lg" />
                    <Skeleton className="mx-auto h-4 w-4/5" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 sm:gap-6 divide-x divide-gray-100 dark:divide-gray-700">
                 <StatItem label={t('dashboard.cvsCreated')} value={stats.resumesCount || 0} color="text-blue-600 dark:text-blue-400" />
                 <StatItem label={t('dashboard.interviews')} value={stats.interviewsCount || 0} color="text-green-600 dark:text-green-400" />
                 <StatItem label={t('dashboard.postViews')} value={stats.postsCount || 0} color="text-orange-600 dark:text-orange-400" />
              </div>
            )}
         </GlassCard>

         <ActivityFeed limit={3} />

         <DashboardModuleLoader>
           <AdvancedStats stats={stats} />
         </DashboardModuleLoader>

         <GlassCard className="p-4 sm:p-6" gradient="blue">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 size={18} className="text-rose-500 dark:text-rose-400" />
                  {t('dashboard.analytics')}
               </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <DashboardModuleLoader>
                 <AnalyticsChart
                  title={t('dashboard.activityOverTime')}
                  data={[
                     { label: t('dashboard.thisWeek'), value: stats.interviewsCount || 0 },
                     { label: t('dashboard.lastWeek'), value: Math.max(0, (stats.interviewsCount || 0) - 2) },
                     { label: t('dashboard.thisMonth'), value: stats.resumesCount || 0 },
                  ]}
                  color="bg-blue-500"
                  previousPeriod={Math.max(0, (stats.interviewsCount || 0) - 2)}
                  currentPeriod={stats.interviewsCount || 0}
               />
               </DashboardModuleLoader>
               <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 rounded-lg border border-rose-200 dark:border-rose-800 p-4">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-rose-500 dark:bg-rose-600 rounded-lg flex items-center justify-center">
                        <Target size={20} className="text-white" />
                     </div>
                     <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('dashboard.achievements')}</h3>
                        <AchievementList achievements={achievements} />
                        <p className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard.yourProgress')}</p>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-700 dark:text-gray-300">{t('dashboard.cvsCreated')}</span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{stats.resumesCount || 0}</span>
                     </div>
                     <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                           className="bg-rose-500 dark:bg-rose-600 h-2 rounded-full transition-all duration-500"
                           style={{ width: `${Math.min(100, ((stats.resumesCount || 0) / 10) * 100)}%` }}
                        />
                     </div>
                     <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('dashboard.nextMilestone')}: 10 CVs</p>
                  </div>
               </div>
            </div>
         </GlassCard>

         <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
               <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{t('dashboard.recommendedForYou')}</h2>
               <Button 
                 variant="link" 
                 className="text-rose-500 dark:text-rose-400 text-xs sm:text-sm p-0 h-auto font-semibold"
                 onClick={handleBlogClick}
               >
                 {t('dashboard.viewAll')}
               </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex gap-4">
                    <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-[70%]" />
                      <Skeleton className="h-4 w-[50%]" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[80%]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              articles.slice(0, 2).map((article) => (
                <RecommendationCard 
                  key={article._id}
                  image={article.image || article.coverImage}
                  title={article.title}
                  author={typeof article.author === 'object' ? article.author?.name || 'Author' : 'Author'}
                  views={article.views ? `${article.views} ${t('blog.views')}` : t('blog.new')}
                  desc={article.summary || article.content?.substring(0, 100) + '...'}
                  onClick={() => navigate(`/blog/${article._id}`)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                 <FileText className="w-12 h-12 text-gray-300 mb-2" />
                 <p className="text-gray-500">{t('blog.noArticlesYet')}</p>
                 <Button onClick={handleBlogClick} variant="outline" className="mt-4">
                    Browse Articles
                 </Button>
              </div>
            )}
         </div>
      </motion.div>
    </MainLayout>
  );
};

export default memo(Dashboard);
