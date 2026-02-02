import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay = ({
  isLoading,
  message = 'Loading...',
  fullScreen = false
}: LoadingOverlayProps) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "flex items-center justify-center z-50",
            "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
            fullScreen ? "fixed inset-0" : "absolute inset-0 rounded-xl"
          )}
        >
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-crimson-red" />
            {message && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
