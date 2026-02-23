import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export const LoadingOverlay = ({ isLoading, message, className }: LoadingOverlayProps) => {
  if (!isLoading) {return null;}

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
        className
      )}
      aria-label="Loading"
      role="status"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-crimson-red" />
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        )}
      </div>
    </div>
  );
};
