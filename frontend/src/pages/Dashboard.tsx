import { useEffect, useMemo, useState, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useCommunityStore } from '@/store/communityStore';
import { useI18n } from '@/store/i18nStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ActivityFeed from '@/components/ActivityFeed';
import { FileText, MessageSquare, Video, TrendingUp, Target, BookOpen } from 'lucide-react';

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
      <h3 className="font-bold text-gray-800 dark:text-white text-xs sm:text-sm truncate">
        {title}
      </h3>
      <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5 line-clamp-2">{desc}</p>
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
    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
      {label}
    </div>
  </motion.div>
));
StatItem.displayName = 'StatItem';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { t } = useI18n();

  const stats = useDashboardStore((state) => state.stats);
  const statsLoading = useDashboardStore((state) => state.isLoading);

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
        await Promise.all([fs(), fp()]);
      } finally {
        if (mounted) setIsInitialLoading(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const profileProgress = useMemo(() => {
    if (!user) return 0;
    const arr = [
      user.onboardingCompleted ? 1 : 0,
      stats.resumesCount > 0 ? 1 : 0,
      stats.interviewsCount > 0 ? 1 : 0,
      stats.postsCount > 0 ? 1 : 0,
    ];
    return (arr.reduce((a, b) => a + b, 0) / arr.length) * 100;
  }, [user?.onboardingCompleted, stats.resumesCount, stats.interviewsCount, stats.postsCount]);

  const handleCommunityClick = useCallback(() => navigate('/community'), [navigate]);
  const handleBuilderClick = useCallback(() => navigate('/builder'), [navigate]);
  const handleInterviewClick = useCallback(() => navigate('/interview'), [navigate]);
  const handleBlogClick = useCallback(() => navigate('/blog'), [navigate]);

  if (!user) return null;

  const isLoading = isInitialLoading || statsLoading;

  return (
    <MainLayout>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <>
                  <Skeleton className="mb-2 h-8 w-3/5" />
                  <Skeleton className="h-5 w-2/5" />
                </>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {greeting}, {user.name?.split(' ')[0]}!
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('dashboard.readyToBoost')}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1">
                <Target size={14} className="text-crimson-red" />
                {t('dashboard.nextBestAction') || 'Next best action'}
              </p>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">
                {t('dashboard.nextActionCreateCV') || 'Tạo CV đầu tiên của bạn'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {t('dashboard.nextActionCreateCVDesc') ||
                  'Bắt đầu với template ATS-friendly và để AI tối ưu nội dung giúp bạn.'}
              </p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t('dashboard.profileCompletion') || 'Profile completion'}
                </span>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-crimson-red rounded-full"
                    style={{ width: `${Math.round(profileProgress)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">
                  {Math.round(profileProgress)}%
                </span>
              </div>
              <Button
                size="sm"
                className="bg-crimson-red hover:bg-fire-red text-white shadow-md"
                onClick={handleBuilderClick}
              >
                {t('dashboard.createCV') || 'Tạo CV'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <QuickActionCard
            icon={<FileText className="text-blue-600" size={24} />}
            title={t('dashboard.createCV')}
            desc={t('dashboard.atsFriendly')}
            color="bg-blue-50 hover:bg-blue-100/80 border-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/30 dark:border-blue-900/50"
            onClick={handleBuilderClick}
          />
          <QuickActionCard
            icon={<Video className="text-green-600" size={24} />}
            title={t('dashboard.interview')}
            desc={t('dashboard.practiceAI')}
            color="bg-green-50 hover:bg-green-100/80 border-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/30 dark:border-green-900/50"
            onClick={handleInterviewClick}
          />
          <QuickActionCard
            icon={<MessageSquare className="text-orange-600" size={24} />}
            title={t('dashboard.community')}
            desc={t('dashboard.getAdvice')}
            color="bg-orange-50 hover:bg-orange-100/80 border-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-900/30 dark:border-orange-900/50"
            onClick={handleCommunityClick}
          />
          <QuickActionCard
            icon={<BookOpen className="text-rose-600" size={24} />}
            title={t('dashboard.article')}
            desc={t('dashboard.shareKnowledge')}
            color="bg-rose-50 hover:bg-rose-100/80 border-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/30 dark:border-rose-900/50"
            onClick={handleBlogClick}
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
          <h2 className="text-heading-3 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-crimson-red" />
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
              <StatItem
                label={t('dashboard.cvsCreated')}
                value={stats.resumesCount || 0}
                color="text-blue-600 dark:text-blue-400"
              />
              <StatItem
                label={t('dashboard.interviews')}
                value={stats.interviewsCount || 0}
                color="text-green-600 dark:text-green-400"
              />
              <StatItem
                label={t('dashboard.postViews')}
                value={stats.postsCount || 0}
                color="text-orange-600 dark:text-orange-400"
              />
            </div>
          )}
        </div>

        <ActivityFeed limit={3} />
      </motion.div>
    </MainLayout>
  );
};

export default memo(Dashboard);
