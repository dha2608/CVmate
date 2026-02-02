import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SmoothCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

const SmoothCard = ({ 
  children, 
  className = '', 
  hover = true,
  delay = 0 
}: SmoothCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      whileHover={hover ? { 
        y: -4, 
        transition: { duration: 0.2 } 
      } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default SmoothCard;
