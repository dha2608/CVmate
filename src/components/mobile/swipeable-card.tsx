import { useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Trash2, Archive, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  color: string;
  action: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
}

export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftActions = [],
  rightActions = [],
  threshold = 100,
  className
}: SwipeableCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const leftWidth = rightActions.length * 80;
  const rightWidth = leftActions.length * 80;

  const leftOpacity = useTransform(x, [-leftWidth, 0], [1, 0]);
  const rightOpacity = useTransform(x, [0, rightWidth], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      if (offset < 0 && rightActions.length > 0) {
        // Swiped left - show right actions
        x.set(-leftWidth);
        if (onSwipeLeft) onSwipeLeft();
      } else if (offset > 0 && leftActions.length > 0) {
        // Swiped right - show left actions
        x.set(rightWidth);
        if (onSwipeRight) onSwipeRight();
      } else {
        x.set(0);
      }
    } else {
      x.set(0);
    }
    setIsDragging(false);
  };

  const handleActionClick = (action: SwipeAction) => {
    action.action();
    x.set(0);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Left Actions Background */}
      {leftActions.length > 0 && (
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute left-0 top-0 bottom-0 flex items-center bg-gray-100 dark:bg-gray-700 z-0"
        >
          {leftActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={cn(
                "h-full px-6 flex items-center justify-center",
                action.color
              )}
            >
              {action.icon}
            </button>
          ))}
        </motion.div>
      )}

      {/* Right Actions Background */}
      {rightActions.length > 0 && (
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute right-0 top-0 bottom-0 flex items-center bg-gray-100 dark:bg-gray-700 z-0"
        >
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={cn(
                "h-full px-6 flex items-center justify-center",
                action.color
              )}
            >
              {action.icon}
            </button>
          ))}
        </motion.div>
      )}

      {/* Card Content */}
      <motion.div
        ref={cardRef}
        drag="x"
        dragConstraints={{ left: -leftWidth, right: rightWidth }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative z-10 bg-white dark:bg-gray-800"
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Pre-configured swipe actions
export const createDeleteAction = (onDelete: () => void): SwipeAction => ({
  icon: <Trash2 size={20} className="text-white" />,
  label: 'Delete',
  color: 'bg-red-500 hover:bg-red-600',
  action: onDelete
});

export const createArchiveAction = (onArchive: () => void): SwipeAction => ({
  icon: <Archive size={20} className="text-white" />,
  label: 'Archive',
  color: 'bg-gray-500 hover:bg-gray-600',
  action: onArchive
});
