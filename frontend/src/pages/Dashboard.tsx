import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useCommunityStore } from '@/store/communityStore';
import { useBlogStore } from '@/store/blogStore';
import { useAchievementStore } from '@/store/achievementStore';
import { useI18n } from '@/store/i18nStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CardEnhanced } from '@/components/ui/card-enhanced';
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
    Loader2,
    BarChart3,
    Target,
    Award,
    Calendar
} from 'lucide-react';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import AdvancedStats from '@/components/dashboard/AdvancedStats';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { stats, fetchStats, isLoading: statsLoading } = useDashboardStore();
  const { posts, fetchPosts, isLoading: postsLoading } = useCommunityStore();
  const { articles, fetchArticles, isLoading: articlesLoading } = useBlogStore();
  const { achievements, fetchAchievements } = useAchievementStore();
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
    if (hour < 12) setGreeting(t('dashboard.goodMorning'));
    else if (hour < 18) setGreeting(t('dashboard.goodAfternoon'));
    else setGreeting(t('dashboard.goodEvening'));

    const loadData = async () => {
      setIsInitialLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchPosts(),
          fetchArticles(),
          fetchAchievements()
        ]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [user, navigate, t, fetchStats, fetchPosts, fetchArticles, fetchAchievements]);

  if (!user) return null;

  const isLoading = isInitialLoading || statsLoading || articlesLoading;

  // Memoize profile progress calculation
  const profileProgress = useMemo(() => {
    const profileSegments = [
      user.onboardingCompleted ? 1 : 0,
      stats.resumesCount > 0 ? 1 : 0,
      stats.interviewsCount > 0 ? 1 : 0,
      stats.postsCount > 0 ? 1 : 0,
    ];
    return (profileSegments.reduce((sum, v) => sum + v, 0) / profileSegments.length) * 100;
  }, [user.onboardingCompleted, stats.resumesCount, stats.interviewsCount, stats.postsCount]);

  // Memoize next action
  const nextAction = useMemo(() => {
    const getNextAction = () => {
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
    };
    return getNextAction();
  }, [user.onboardingCompleted, stats.resumesCount, stats.interviewsCount, t]);

  return (
    <MainLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
         <div className="glass-card bg-white/90 dark:bg-gray-800/90">
            <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
               <div className="flex-1 min-w-0">
                  {isLoading ? (
                    <>
                      <Skeleton variant="text" width="60%" height={32} className="mb-2" />
                      <Skeleton variant="text" width="40%" height={20} />
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
               onClick={() => navigate('/community')}
               className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50"
            >
               <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 shadow-sm border border-gray-100 dark:border-gray-600 flex-shrink-0">
                  <PenTool size={18} />
               </div>
               <span className="text-gray-500 dark:text-gray-400 text-sm font-medium flex-1">{t('dashboard.startPost')}</span>
            </div>
         </div>

         {/* Next Best Action + Profile Progress */}
         <div className="glass-card bg-white/90 dark:bg-gray-800/90">
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
               <Button
                 size="sm"
                 className="whitespace-nowrap bg-crimson-red hover:bg-fire-red text-white"
                 onClick={() => navigate(nextAction.href)}
               >
                 {nextAction.cta}
               </Button>
             </div>
           </div>
         </div>

         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <QuickActionCard 
               icon={<FileText className="text-blue-600" size={24} />}
               title={t('dashboard.createCV')}
               desc={t('dashboard.atsFriendly')}
               color="bg-blue-50 hover:bg-blue-100/80 border-blue-100"
               onClick={() => navigate('/builder')}
            />
            <QuickActionCard 
               icon={<Video className="text-green-600" size={24} />}
               title={t('dashboard.interview')}
               desc={t('dashboard.practiceAI')}
               color="bg-green-50 hover:bg-green-100/80 border-green-100"
               onClick={() => navigate('/interview')}
            />
            <QuickActionCard 
               icon={<MessageSquare className="text-orange-600" size={24} />}
               title={t('dashboard.community')}
               desc={t('dashboard.getAdvice')}
               color="bg-orange-50 hover:bg-orange-100/80 border-orange-100"
               onClick={() => navigate('/community')}
            />
            <QuickActionCard 
               icon={<Plus className="text-rose-600" size={24} />}
               title={t('dashboard.article')}
               desc={t('dashboard.shareKnowledge')}
               color="bg-rose-50 hover:bg-rose-100/80 border-rose-100"
               onClick={() => navigate('/blog')}
            />
         </div>

         <div className="glass-card bg-white/90 dark:bg-gray-800/90">
            <h2 className="text-heading-3 mb-6 flex items-center gap-2">
               <TrendingUp size={20} className="text-crimson-red dark:text-red-400" />
               {t('dashboard.yourActivity')}
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <Skeleton variant="rectangular" height={40} className="mb-2 rounded-lg" />
                    <Skeleton variant="text" width="80%" className="mx-auto" />
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
         </div>

         {/* Activity Feed */}
         <ActivityFeed limit={3} />

         {/* Advanced Statistics */}
         <AdvancedStats stats={stats} />

         {/* Advanced Analytics */}
         <div className="glass-card bg-white/90 dark:bg-gray-800/90">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 size={18} className="text-rose-500 dark:text-rose-400" />
                  {t('dashboard.analytics')}
               </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
         </div>

         <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
               <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{t('dashboard.recommendedForYou')}</h2>
               <Button 
                 variant="link" 
                 className="text-rose-500 dark:text-rose-400 text-xs sm:text-sm p-0 h-auto font-semibold"
                 onClick={() => navigate('/blog')}
               >
                 {t('dashboard.viewAll')}
               </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex gap-4">
                    <Skeleton variant="rectangular" width={96} height={96} className="rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" width="70%" height={20} />
                      <Skeleton variant="text" width="50%" height={16} />
                      <Skeleton variant="text" width="100%" height={16} />
                      <Skeleton variant="text" width="80%" height={16} />
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
              <EmptyState
                icon={FileText}
                title={t('blog.noArticlesYet')}
                description={t('dashboard.noArticlesDescription') || "Check back later for new articles"}
                action={
                  <Button onClick={() => navigate('/blog')} variant="outline">
                    Browse Articles
                  </Button>
                }
              />
            )}
         </div>
      </motion.div>
    </MainLayout>
  );
};

const QuickActionCard = ({ icon, title, desc, color, onClick }: any) => (
   <div 
      onClick={onClick}
      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col items-center text-center gap-2 ${color} dark:border-gray-700 hover:shadow-md hover:scale-[1.02] active:scale-100`}
   >
      <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
         {icon}
      </div>
      <div className="min-w-0 w-full">
         <h3 className="font-bold text-gray-800 dark:text-white text-xs sm:text-sm truncate">{title}</h3>
         <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{desc}</p>
      </div>
   </div>
);

const StatItem = ({ label, value, color }: any) => (
   <div className="text-center">
      <div className={`text-2xl sm:text-3xl font-black ${color} mb-1`}>{value}</div>
      <div className="text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</div>
   </div>
);

const RecommendationCard = ({ image, title, author, views, desc, onClick }: any) => {
  const { t } = useI18n();
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex gap-3 sm:gap-4 items-start group hover:scale-[1.01] active:scale-100"
      onClick={onClick}
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
    </div>
  );
};

export default Dashboard;