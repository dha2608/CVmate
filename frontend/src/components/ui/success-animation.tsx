import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const SuccessAnimation = ({
  show,
  message,
  onComplete,
  size = 'md'
}: SuccessAnimationProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 16,
    md: 32,
    lg: 48
  };

  if (!show) {return null;}

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15
      }}
      onAnimationComplete={onComplete}
      className="flex flex-col items-center justify-center gap-2"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.1
        }}
        className={cn(
          "rounded-full bg-green-500 flex items-center justify-center",
          sizeClasses[size]
        )}
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CheckCircle2 
            className="text-white" 
            size={iconSizes[size]}
            strokeWidth={3}
          />
        </motion.div>
      </motion.div>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
};

// Confetti Animation Component
interface ConfettiProps {
  show: boolean;
  onComplete?: () => void;
}

export const Confetti = ({ show, onComplete }: ConfettiProps) => {
  if (!show) {return null;}

  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    color: ['#DC143C', '#CE1126', '#FFD700', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 5)]
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            opacity: 1,
            scale: 1
          }}
          animate={{
            y: '110vh',
            opacity: 0,
            scale: 0,
            rotate: 360
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeOut'
          }}
          onAnimationComplete={() => {
            if (particle.id === particles.length - 1) {
              onComplete?.();
            }
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </div>
  );
};
