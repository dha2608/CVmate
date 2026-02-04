import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  delay?: number;
}

const Card = ({ children, className = '', hover = false, onClick, delay = 0 }: CardProps) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300';
  const hoverClasses = hover ? 'hover:shadow-lg hover:border-crimson-red dark:hover:border-red-500 cursor-pointer' : '';
  
  const content = (
    <div className={cn(baseClasses, hoverClasses, className)}>
      {children}
    </div>
  );

  if (onClick || hover) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
        onClick={onClick}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {content}
    </motion.div>
  );
};

export default Card;
