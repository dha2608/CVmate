import { FileText, Users, Briefcase, MessageSquare, Search, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IllustrationProps {
  className?: string;
  size?: number;
}

// Empty State Illustrations
export const EmptyResumeIllustration = ({ className, size = 120 }: IllustrationProps) => (
  <div className={cn("flex flex-col items-center justify-center", className)}>
    <div className="relative">
      <div className="absolute inset-0 bg-crimson-red/10 rounded-full blur-2xl" />
      <FileText 
        size={size} 
        className="relative text-crimson-red/50 dark:text-red-400/50"
        strokeWidth={1.5}
      />
    </div>
  </div>
);

export const EmptyCommunityIllustration = ({ className, size = 120 }: IllustrationProps) => (
  <div className={cn("flex flex-col items-center justify-center", className)}>
    <div className="relative">
      <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl" />
      <Users 
        size={size} 
        className="relative text-blue-500/50 dark:text-blue-400/50"
        strokeWidth={1.5}
      />
    </div>
  </div>
);

export const EmptyJobsIllustration = ({ className, size = 120 }: IllustrationProps) => (
  <div className={cn("flex flex-col items-center justify-center", className)}>
    <div className="relative">
      <div className="absolute inset-0 bg-green-500/10 rounded-full blur-2xl" />
      <Briefcase 
        size={size} 
        className="relative text-green-500/50 dark:text-green-400/50"
        strokeWidth={1.5}
      />
    </div>
  </div>
);

export const EmptyMessagesIllustration = ({ className, size = 120 }: IllustrationProps) => (
  <div className={cn("flex flex-col items-center justify-center", className)}>
    <div className="relative">
      <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-2xl" />
      <MessageSquare 
        size={size} 
        className="relative text-purple-500/50 dark:text-purple-400/50"
        strokeWidth={1.5}
      />
    </div>
  </div>
);

export const EmptySearchIllustration = ({ className, size = 120 }: IllustrationProps) => (
  <div className={cn("flex flex-col items-center justify-center", className)}>
    <div className="relative">
      <div className="absolute inset-0 bg-gray-400/10 rounded-full blur-2xl" />
      <Search 
        size={size} 
        className="relative text-gray-400/50 dark:text-gray-500/50"
        strokeWidth={1.5}
      />
    </div>
  </div>
);

export const EmptyAIIllustration = ({ className, size = 120 }: IllustrationProps) => (
  <div className={cn("flex flex-col items-center justify-center", className)}>
    <div className="relative">
      <div className="absolute inset-0 bg-crimson-red/10 rounded-full blur-2xl" />
      <Brain 
        size={size} 
        className="relative text-crimson-red/50 dark:text-red-400/50"
        strokeWidth={1.5}
      />
    </div>
  </div>
);

// Loading Illustrations
export const LoadingIllustration = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>
    <div className="relative">
      <div className="w-16 h-16 border-4 border-crimson-red/20 border-t-crimson-red rounded-full animate-spin" />
    </div>
  </div>
);
