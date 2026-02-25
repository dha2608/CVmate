import { useEffect, useState }from 'react';
import { useAuthStore }from '@/store/authStore';
import { useDashboardStore }from '@/store/dashboardStore';
import { useBlogStore }from '@/store/blogStore';
import { useAchievementStore }from '@/store/achievementStore';

const Dashboard = () => {
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
    <div style={{ minHeight: '100vh', padding: 24, background: '#fff', color: '#111' }}>
      <h1>Dashboard Debug Mode</h1>
      <p>User: {user.name || user.email}</p>
      <p>Loading: {String(loading)}</p>
      <p>Resumes: {stats.resumesCount || 0}</p>
      <p>Interviews: {stats.interviewsCount || 0}</p>
      <p>Posts: {stats.postsCount || 0}</p>
      <p>Articles: {articles.length}</p>
      <p>Achievements: {achievements.length}</p>
    </div>
  );
};

export default Dashboard;
