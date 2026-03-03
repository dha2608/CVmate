import {
  Medal,
  ScrollText,
  UserCheck,
  BriefcaseBusiness,
  PenLine,
  MessageCircleMore,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AchievementBadgeProps {
  type: 'first_cv' | 'complete_profile' | 'apply_job' | 'write_post' | 'complete_interview';
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const achievementConfig = {
  first_cv: {
    icon: ScrollText,
    label: 'First CV',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  complete_profile: {
    icon: UserCheck,
    label: 'Complete Profile',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  apply_job: {
    icon: BriefcaseBusiness,
    label: 'First Application',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  write_post: {
    icon: PenLine,
    label: 'First Post',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  complete_interview: {
    icon: MessageCircleMore,
    label: 'First Interview',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
  },
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  type,
  unlocked,
  size = 'md',
}) => {
  const config = achievementConfig[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        ${
          unlocked
            ? `bg-gradient-to-br ${config.color} shadow-lg`
            : `bg-gray-200 dark:bg-gray-700 ${config.bgColor} border-2 ${config.borderColor}`
        }
        flex items-center justify-center
        transition-all duration-300
        ${unlocked ? 'cursor-pointer' : 'opacity-50'}
      `}
      title={config.label}
    >
      {unlocked ? (
        <Icon size={iconSizes[size]} className="text-white" />
      ) : (
        <Icon size={iconSizes[size]} className="text-gray-400 dark:text-gray-500" />
      )}
    </motion.div>
  );
};

export const AchievementList: React.FC<{ achievements: any[] }> = ({ achievements }) => {
  const allTypes: Array<
    'first_cv' | 'complete_profile' | 'apply_job' | 'write_post' | 'complete_interview'
  > = ['first_cv', 'complete_profile', 'apply_job', 'write_post', 'complete_interview'];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {allTypes.map((type) => {
        const unlocked = achievements.some((a) => a.type === type);
        return (
          <div key={type} className="flex flex-col items-center gap-2">
            <AchievementBadge type={type} unlocked={unlocked} size="md" />
            <span className="text-xs text-center text-gray-600 dark:text-gray-400">
              {achievementConfig[type].label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
