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
import {
  FileText,
  MessageSquare,
  Video,
  TrendingUp,
  Target,
  BookOpen,
  BarChart3,
  Briefcase,
  BookMarked,
  Award,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

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

const StatCard = memo(({ icon, label, value, color, bgColor, delay = 0 }: any) => (
  <motion.div
    className={`relative overflow-hidden rounded-xl border p-3 sm:p-4 ${bgColor} dark:border-gray-700`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className={`text-xl sm:text-2xl font-black ${color}`}>{value}</div>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">
          {label}
        </div>
      </div>
    </div>
  </motion.div>
));
StatCard.displayName = 'StatCard';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { t, language } = useI18n();

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
      stats.articlesCount > 0 ? 1 : 0,
    ];
    return (arr.reduce((a, b) => a + b, 0) / arr.length) * 100;
  }, [
    user?.onboardingCompleted,
    stats.resumesCount,
    stats.interviewsCount,
    stats.postsCount,
    stats.articlesCount,
  ]);

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

        {/* Stats Grid - 6 metrics */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
          <h2 className="text-heading-3 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-crimson-red" />
            {t('dashboard.yourActivity')}
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard
                icon={<FileText size={18} className="text-blue-600" />}
                label={t('dashboard.cvsCreated')}
                value={stats.resumesCount || 0}
                color="text-blue-600 dark:text-blue-400"
                bgColor="bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50"
                delay={0}
              />
              <StatCard
                icon={<Video size={18} className="text-green-600" />}
                label={t('dashboard.interviews')}
                value={stats.interviewsCount || 0}
                color="text-green-600 dark:text-green-400"
                bgColor="bg-green-50 border-green-100 dark:bg-green-950/30 dark:border-green-900/50"
                delay={0.05}
              />
              <StatCard
                icon={<MessageSquare size={18} className="text-orange-600" />}
                label={t('dashboard.posts')}
                value={stats.postsCount || 0}
                color="text-orange-600 dark:text-orange-400"
                bgColor="bg-orange-50 border-orange-100 dark:bg-orange-950/30 dark:border-orange-900/50"
                delay={0.1}
              />
              <StatCard
                icon={<BookMarked size={18} className="text-rose-600" />}
                label={t('dashboard.articles')}
                value={stats.articlesCount || 0}
                color="text-rose-600 dark:text-rose-400"
                bgColor="bg-rose-50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50"
                delay={0.15}
              />
              <StatCard
                icon={<Briefcase size={18} className="text-purple-600" />}
                label={t('dashboard.applications')}
                value={stats.applicationsCount || 0}
                color="text-purple-600 dark:text-purple-400"
                bgColor="bg-purple-50 border-purple-100 dark:bg-purple-950/30 dark:border-purple-900/50"
                delay={0.2}
              />
              <StatCard
                icon={<Award size={18} className="text-amber-600" />}
                label={t('dashboard.avgAtsScore')}
                value={stats.avgAtsScore > 0 ? `${stats.avgAtsScore}%` : '—'}
                color="text-amber-600 dark:text-amber-400"
                bgColor="bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50"
                delay={0.25}
              />
            </div>
          )}
        </div>

        {/* Performance Overview */}
        {!isLoading && (stats.avgAtsScore > 0 || stats.avgInterviewScore > 0) && (
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-5">
            <h2 className="text-heading-3 mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-crimson-red" />
              {t('dashboard.analytics')}
            </h2>
            <div className="space-y-4">
              {stats.avgAtsScore > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('dashboard.avgAtsScore')}
                    </span>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      {stats.avgAtsScore}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(stats.avgAtsScore, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}
              {stats.avgInterviewScore > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('dashboard.avgInterviewScore')}
                    </span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {stats.avgInterviewScore}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(stats.avgInterviewScore, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Items Timeline */}
        {!isLoading && (stats.recentResumes.length > 0 || stats.recentInterviews.length > 0) && (
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-5">
            <h2 className="text-heading-3 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-crimson-red" />
              {t('dashboard.recentItems')}
            </h2>
            <div className="space-y-2.5">
              {stats.recentResumes.map((r) => (
                <motion.div
                  key={r._id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/builder?id=${r._id}`)}
                  whileHover={{ scale: 1.01 }}
                >
                  <FileText size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {r.title || 'Untitled CV'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {r.atsScore ? `ATS: ${r.atsScore}%` : t('dashboard.cvsCreated')}
                      {' · '}
                      {formatDistanceToNow(new Date(r.updatedAt), {
                        addSuffix: true,
                        locale: language === 'vi' ? vi : enUS,
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {stats.recentInterviews.map((iv) => (
                <motion.div
                  key={iv._id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-green-50 border-green-100 dark:bg-green-950/30 dark:border-green-900/50 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/interview')}
                  whileHover={{ scale: 1.01 }}
                >
                  <Video size={16} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {iv.persona}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {iv.feedback?.score
                        ? `Score: ${iv.feedback.score}%`
                        : t('dashboard.interviews')}
                      {' · '}
                      {formatDistanceToNow(new Date(iv.createdAt), {
                        addSuffix: true,
                        locale: language === 'vi' ? vi : enUS,
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <ActivityFeed limit={3} />
      </motion.div>
    </MainLayout>
  );
};

export default memo(Dashboard);
