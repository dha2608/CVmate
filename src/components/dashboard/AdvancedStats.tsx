import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Award, Calendar, BarChart3, Video } from 'lucide-react';
import { useI18n } from '@/store/i18nStore';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard = ({ title, value, change, icon, color, trend = 'neutral' }: StatCardProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
            <TrendIcon size={14} />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{title}</div>
    </motion.div>
  );
};

interface AdvancedStatsProps {
  stats: {
    resumesCount: number;
    interviewsCount: number;
    postsCount: number;
    applicationsCount?: number;
    successRate?: number;
  };
}

const AdvancedStats = ({ stats }: AdvancedStatsProps) => {
  const { t } = useI18n();

  // Calculate trends (mock data - replace with actual)
  const trends = {
    resumes: 12,
    interviews: 8,
    posts: -5,
    applications: 15,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={20} className="text-crimson-red" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Advanced Statistics</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.cvsCreated')}
          value={stats.resumesCount || 0}
          change={trends.resumes}
          icon={<Target size={20} className="text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
          trend="up"
        />
        <StatCard
          title={t('dashboard.interviews')}
          value={stats.interviewsCount || 0}
          change={trends.interviews}
          icon={<Video size={20} className="text-green-600" />}
          color="bg-green-50 dark:bg-green-900/20"
          trend="up"
        />
        <StatCard
          title={t('dashboard.postViews')}
          value={stats.postsCount || 0}
          change={trends.posts}
          icon={<Award size={20} className="text-orange-600" />}
          color="bg-orange-50 dark:bg-orange-900/20"
          trend="down"
        />
        <StatCard
          title="Applications"
          value={stats.applicationsCount || 0}
          change={trends.applications}
          icon={<Calendar size={20} className="text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/20"
          trend="up"
        />
      </div>

      {/* Success Rate Card */}
      {stats.successRate !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-crimson-red to-fire-red rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Success Rate</h4>
            <Award size={24} />
          </div>
          <div className="text-4xl font-black mb-2">{stats.successRate}%</div>
          <p className="text-sm opacity-90">Your application success rate this month</p>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedStats;
