import { useEffect, useState, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/store/i18nStore';
import { CalendarClock, ScrollText, Mic, PenLine, BriefcaseBusiness, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'resume' | 'interview' | 'post' | 'job' | 'article';
  action: string;
  title: string;
  timestamp: Date;
  link?: string;
}

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
}

const ActivityFeed = memo(({ limit = 5, showHeader = true }: ActivityFeedProps) => {
  const { language } = useI18n();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const displayedActivities = useMemo(() => {
    return activities.slice(0, limit);
  }, [activities, limit]);

  useEffect(() => {
    const loadActivities = async () => {
      setIsLoading(true);

      try {
        // Try to fetch from API first
        const { api } = await import('@/lib/utils');
        const response = await api.getActivities(limit);

        if (response?.success && response?.data) {
          const apiActivities: Activity[] = response.data.map((a: any) => ({
            id: a._id || a.id,
            type: a.type || 'post',
            action: a.action || a.title || 'Activity',
            title: a.title || a.description || '',
            timestamp: new Date(a.timestamp || a.createdAt),
            link: a.link || a.url,
          }));

          // Sort by timestamp (newest first)
          apiActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          setActivities(apiActivities.slice(0, limit));
        } else {
          // Fallback to localStorage
          const storedActivities = localStorage.getItem('recentActivities');
          let parsedActivities: Activity[] = [];

          if (storedActivities) {
            try {
              parsedActivities = JSON.parse(storedActivities).map((a: any) => ({
                ...a,
                timestamp: new Date(a.timestamp),
              }));
            } catch (error) {
              console.error('Failed to parse activities:', error);
            }
          }

          // Sort by timestamp (newest first)
          parsedActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          setActivities(parsedActivities.slice(0, limit));
        }
      } catch (error) {
        console.error('Failed to load activities:', error);
        // Fallback to localStorage on error
        const storedActivities = localStorage.getItem('recentActivities');
        if (storedActivities) {
          try {
            const parsedActivities = JSON.parse(storedActivities).map((a: any) => ({
              ...a,
              timestamp: new Date(a.timestamp),
            }));
            parsedActivities.sort(
              (a: Activity, b: Activity) => b.timestamp.getTime() - a.timestamp.getTime()
            );
            setActivities(parsedActivities.slice(0, limit));
          } catch (e) {
            console.error('Failed to parse activities:', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();

    // Listen for new activities
    const handleStorageChange = () => {
      loadActivities();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [limit]);

  const getActivityIcon = (type: Activity['type']) => {
    const iconClass = 'w-4 h-4 sm:w-5 sm:h-5';
    switch (type) {
      case 'resume':
        return <ScrollText className={`${iconClass} text-blue-600 dark:text-blue-400`} />;
      case 'interview':
        return <Mic className={`${iconClass} text-green-600 dark:text-green-400`} />;
      case 'post':
        return <PenLine className={`${iconClass} text-orange-600 dark:text-orange-400`} />;
      case 'job':
        return (
          <BriefcaseBusiness className={`${iconClass} text-purple-600 dark:text-purple-400`} />
        );
      case 'article':
        return <Activity className={`${iconClass} text-red-600 dark:text-red-400`} />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'resume':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'interview':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'post':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'job':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'article':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        {showHeader && (
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-crimson-red dark:text-red-400" />
            Recent Activity
          </h3>
        )}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        {showHeader && (
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-crimson-red dark:text-red-400" />
            Recent Activity
          </h3>
        )}
        <div className="text-center py-8">
          <CalendarClock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có hoạt động gần đây</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      {showHeader && (
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-crimson-red dark:text-red-400" />
          Recent Activity
        </h3>
      )}
      <div className="space-y-3">
        {displayedActivities.map((activity) => (
          <div
            key={activity.id}
            onClick={() => activity.link && navigate(activity.link)}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
              activity.link ? 'hover:scale-[1.02]' : ''
            } ${getActivityColor(activity.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                {activity.action}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5">
                {activity.title}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                <CalendarClock className="w-3 h-3" />
                {formatDistanceToNow(activity.timestamp, {
                  addSuffix: true,
                  locale: language === 'vi' ? vi : enUS,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ActivityFeed.displayName = 'ActivityFeed';

export default ActivityFeed;
