import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface ScrollAnimatedProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  distance?: number;
  triggerOnce?: boolean;
}

export const ScrollAnimated = ({
  children,
  className,
  delay = 0,
  direction = 'up',
  distance = 30,
  triggerOnce = true
}: ScrollAnimatedProps) => {
  const { ref, isVisible } = useScrollAnimation({ triggerOnce });

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, opacity: 0 };
      case 'down':
        return { y: -distance, opacity: 0 };
      case 'left':
        return { x: distance, opacity: 0 };
      case 'right':
        return { x: -distance, opacity: 0 };
      case 'fade':
        return { opacity: 0 };
      default:
        return { y: distance, opacity: 0 };
    }
  };

  const getAnimatePosition = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { y: 0, opacity: 1 };
      case 'left':
      case 'right':
        return { x: 0, opacity: 1 };
      case 'fade':
        return { opacity: 1 };
      default:
        return { y: 0, opacity: 1 };
    }
  };

  return (
    <motion.div
      ref={ref as any}
      initial={getInitialPosition()}
      animate={isVisible ? getAnimatePosition() : getInitialPosition()}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
