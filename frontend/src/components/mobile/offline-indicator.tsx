import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator if offline on mount
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-4 py-3",
          "flex items-center justify-center gap-2",
          "text-sm font-medium",
          isOnline
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        )}
      >
        {isOnline ? (
          <>
            <Wifi size={18} />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff size={18} />
            <span>You're offline. Some features may be unavailable.</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
