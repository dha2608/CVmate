import { useEffect, useMemo, useState }from 'react';
import { useNavigate }from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAuthStore }from '@/store/authStore';
import { useDashboardStore }from '@/store/dashboardStore';
import { useBlogStore }from '@/store/blogStore';
import { useAchievementStore }from '@/store/achievementStore';
import { useI18n }from '@/store/i18nStore';
import { Button }from '@/components/ui/button';
import { logger }from '@/lib/logger';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t }= useI18n();
  const user = useAuthStore((state) => state.user);

  const { stats, fetchStats, isLoading: statsLoading }= useDashboardStore((state) => ({
    stats: state.stats,
    fetchStats: state.fetchStats,
    isLoading: state.isLoading,
  }));

  const { articles, fetchArticles, isLoading: articlesLoading }= useBlogStore((state) => ({
    articles: state.articles,
    fetchArticles: state.fetchArticles,
    isLoading: state.isLoading,
  }));

  const { achievements, fetchAchievements }= useAchievementStore((state) => ({
    achievements: state.achievements,
    fetchAchievements: state.fetchAchievements,
  }));

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 18) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  }, [t]);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    const load = async () => {
      setIsInitialLoading(true);
      const start = performance.now();
      try {
        await Promise.all([fetchStats(), fetchArticles(), fetchAchievements()]);
        logger.info('dashboard_loaded_minimal', { durationMs: Math.round(performance.now() - start) });
      }catch (error) {
        logger.error('dashboard_load_error_minimal', error);
      }finally {
        if (mounted) {
          setIsInitialLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user, fetchStats, fetchArticles, fetchAchievements]);

  if (!user) return null;

  const loading = isInitialLoading || statsLoading || articlesLoading;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}, {user.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('dashboard.readyToBoost')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500">{t('dashboard.cvsCreated')}</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{loading ? '...' : stats.resumesCount || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500">{t('dashboard.interviews')}</p>
            <p className="text-2xl font-black text-green-600 dark:text-green-400">{loading ? '...' : stats.interviewsCount || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500">{t('dashboard.postViews')}</p>
            <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{loading ? '...' : stats.postsCount || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Articles: {loading ? '...' : articles.length}· Achievements: {loading ? '...' : achievements.length}
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => navigate('/builder')}>{t('dashboard.createCV')}</Button>
            <Button variant="outline" onClick={() => navigate('/interview')}>{t('dashboard.startInterview') || 'Start interview'}</Button>
            <Button variant="outline" onClick={() => navigate('/jobs')}>{t('dashboard.viewJobs') || 'View jobs'}</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
