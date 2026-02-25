import { useEffect, useState }from 'react';
import { useNavigate }from 'react-router-dom';
import { useAuthStore }from '@/store/authStore';
import { useDashboardStore }from '@/store/dashboardStore';
import { useBlogStore }from '@/store/blogStore';
import { useAchievementStore }from '@/store/achievementStore';
import { Button }from '@/components/ui/button';
import { FileText, Video, Briefcase, Sparkles }from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const fetchStats = useDashboardStore((state) => state.fetchStats);
  const stats = useDashboardStore((state) => state.stats);
  const fetchArticles = useBlogStore((state) => state.fetchArticles);
  const articles = useBlogStore((state) => state.articles);
  const fetchAchievements = useAchievementStore((state) => state.fetchAchievements);
  const achievements = useAchievementStore((state) => state.achievements);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchStats(), fetchArticles(), fetchAchievements()]);
      }finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [user, fetchStats, fetchArticles, fetchAchievements]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Welcome back</p>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                {user.name || user.email}
              </h1>
            </div>
            <Button onClick={() => navigate('/builder')}className="bg-crimson-red hover:bg-fire-red text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Create CV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">CVs Created</p>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">{loading ? '...' : stats.resumesCount || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Interviews</p>
            <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-2">{loading ? '...' : stats.interviewsCount || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Posts</p>
            <p className="text-3xl font-black text-orange-600 dark:text-orange-400 mt-2">{loading ? '...' : stats.postsCount || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Articles: <strong>{loading ? '...' : articles.length}</strong> · Achievements: <strong>{loading ? '...' : achievements.length}</strong>
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate('/builder')}>
              <FileText className="w-4 h-4 mr-2" />
              Open Builder
            </Button>
            <Button variant="outline" onClick={() => navigate('/interview')}>
              <Video className="w-4 h-4 mr-2" />
              Practice Interview
            </Button>
            <Button variant="outline" onClick={() => navigate('/jobs')}>
              <Briefcase className="w-4 h-4 mr-2" />
              Browse Jobs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
