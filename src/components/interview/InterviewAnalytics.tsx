import { useEffect, useState } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import { TrendingUp, TrendingDown, Minus, BarChart3, PieChart } from 'lucide-react';
import { useI18n } from '@/store/i18nStore';

interface AnalyticsData {
  totalInterviews: number;
  averageScore: number;
  improvement: number;
  bestPersona: string;
  totalQuestions: number;
  averageResponseTime: number;
}

const InterviewAnalytics = () => {
  const { t } = useI18n();
  const { feedback } = useInterviewStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from API
    // For now, we'll use mock data based on current feedback
    if (feedback) {
      setAnalytics({
        totalInterviews: 5,
        averageScore: feedback.confidenceScore || 75,
        improvement: 12,
        bestPersona: 'friendly-hr',
        totalQuestions: 8,
        averageResponseTime: 15,
      });
    }
  }, [feedback]);

  if (!analytics) return null;

  const StatCard = ({ label, value, trend, icon: Icon }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trend > 0 ? 'text-green-600 dark:text-green-400' : 
            trend < 0 ? 'text-red-600 dark:text-red-400' : 
            'text-gray-500'
          }`}>
            {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-crimson-red" />}
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-crimson-red" />
        Your Interview Analytics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Interviews"
          value={analytics.totalInterviews}
          icon={PieChart}
        />
        <StatCard
          label="Average Score"
          value={`${analytics.averageScore}%`}
          trend={analytics.improvement}
          icon={TrendingUp}
        />
        <StatCard
          label="Best Persona"
          value={analytics.bestPersona.replace('-', ' ')}
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Overall Performance</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{analytics.averageScore}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-crimson-red to-fire-red h-full rounded-full transition-all duration-500"
            style={{ width: `${analytics.averageScore}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewAnalytics;
