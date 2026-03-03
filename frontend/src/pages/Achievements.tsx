import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useAchievementStore } from '@/store/achievementStore';
import { useI18n } from '@/store/i18nStore';
import MainLayout from '@/components/layout/MainLayout';
import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import { Medal, Lock, CircleCheckBig } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type AchievementType =
  | 'first_cv'
  | 'complete_profile'
  | 'apply_job'
  | 'write_post'
  | 'complete_interview';

const achievementDetails: Record<AchievementType, { title: string; description: string }> = {
  first_cv: {
    title: 'First CV',
    description: 'Create your first resume using the CV Builder.',
  },
  complete_profile: {
    title: 'Complete Profile',
    description: 'Fill in all profile fields including bio, skills, and social links.',
  },
  apply_job: {
    title: 'First Application',
    description: 'Apply to your first job listing.',
  },
  write_post: {
    title: 'First Post',
    description: 'Write your first post in the Community.',
  },
  complete_interview: {
    title: 'First Interview',
    description: 'Complete an AI mock interview session.',
  },
};

const allTypes = [
  'first_cv',
  'complete_profile',
  'apply_job',
  'write_post',
  'complete_interview',
] as const;

const Achievements = () => {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { achievements, stats, isLoading, fetchAchievements, fetchStats } = useAchievementStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAchievements();
    fetchStats();
  }, [user, navigate, fetchAchievements, fetchStats]);

  if (!user) return null;

  const unlockedCount = stats?.total ?? 0;
  const totalCount = allTypes.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-4 sm:py-6 lg:py-8 px-2 sm:px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-crimson-red dark:text-red-400" />
            {t('nav.achievements') || 'Achievements'}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {t('achievements.subtitle') ||
              'Track your progress and unlock badges as you use CVmate.'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('achievements.progress') || 'Progress'}
            </span>
            <span className="text-sm font-bold text-crimson-red dark:text-red-400">
              {unlockedCount}/{totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-crimson-red to-fire-red h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Achievement Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
              >
                <div className="flex items-center gap-4">
                  <Skeleton variant="circular" width={48} height={48} />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="80%" height={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allTypes.map((type) => {
              const achievement = achievements.find((a) => a.type === type);
              const unlocked = !!achievement;
              const details = achievementDetails[type];

              return (
                <div
                  key={type}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 sm:p-6 transition-all duration-300 ${
                    unlocked
                      ? 'border-crimson-red/30 dark:border-red-700/30 hover:shadow-md'
                      : 'border-gray-200 dark:border-gray-700 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <AchievementBadge type={type} unlocked={unlocked} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                          {details.title}
                        </h3>
                        {unlocked ? (
                          <CircleCheckBig className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {details.description}
                      </p>
                      {unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-crimson-red dark:text-red-400">
                          {t('achievements.unlockedOn') || 'Unlocked on'}{' '}
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state when no achievements at all */}
        {!isLoading && unlockedCount === 0 && (
          <div className="mt-6 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <Medal className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('achievements.empty') ||
                'No achievements yet. Start using CVmate to unlock badges!'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Achievements;
