import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StickyHeaderProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  hideOnScroll?: boolean;
}

export const StickyHeader = ({
  children,
  className,
  threshold = 50,
  hideOnScroll = false
}: StickyHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, threshold], [1, hideOnScroll ? 0 : 1]);
  const y = useTransform(scrollY, [0, threshold], [0, hideOnScroll ? -100 : 0]);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > threshold);
    });

    return () => unsubscribe();
  }, [scrollY, threshold]);

  return (
    <motion.header
      style={{ opacity, y }}
      className={cn(
        "sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm",
        "border-b border-gray-200 dark:border-gray-700",
        isScrolled && "shadow-sm",
        className
      )}
    >
      {children}
    </motion.header>
  );
};
