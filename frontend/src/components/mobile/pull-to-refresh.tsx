import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
  className?: string;
}

export const PullToRefresh = ({
  onRefresh,
  children,
  threshold = 80,
  disabled = false,
  className
}: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const y = useMotionValue(0);
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    const container = containerRef.current;
    if (!container) return;

    // Only trigger if at the top of the scroll
    if (container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      const pullAmount = Math.min(distance * 0.5, threshold * 1.5);
      setPullDistance(pullAmount);
      y.set(pullAmount);
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current || disabled || isRefreshing) return;

    isPulling.current = false;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      y.set(60);
      
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          y.set(0);
          setPullDistance(0);
          setIsRefreshing(false);
        }, 300);
      }
    } else {
      y.set(0);
      setPullDistance(0);
    }
  };

  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const shouldShowIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        style={{ y: springY }}
        className="relative"
      >
        {shouldShowIndicator && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-center h-16 z-10">
            {isRefreshing ? (
              <Loader2 className="w-6 h-6 animate-spin text-crimson-red" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  animate={{ rotate: progress >= 100 ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    className="w-6 h-6 text-crimson-red"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </motion.div>
                {progress >= 100 && (
                  <span className="text-xs text-crimson-red">Release to refresh</span>
                )}
              </div>
            )}
          </div>
        )}
        <div className={cn(shouldShowIndicator && "pt-16")}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};
