import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardEnhancedProps {
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
  delay?: number;
}

export const CardEnhanced = ({
  children,
  hover = false,
  onClick,
  className,
  delay = 0
}: CardEnhancedProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700",
        "p-6 shadow-sm transition-all duration-300",
        hover && "hover:shadow-lg hover:border-crimson-red dark:hover:border-red-500",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
