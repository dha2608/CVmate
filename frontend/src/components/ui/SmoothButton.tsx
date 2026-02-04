import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Button } from './button';
import { ButtonProps } from './button';

interface SmoothButtonProps extends ButtonProps {
  children: ReactNode;
  hoverScale?: number;
  tapScale?: number;
}

const SmoothButton = ({ 
  children, 
  hoverScale = 1.02, 
  tapScale = 0.98,
  className = '',
  ...props 
}: SmoothButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button className={className} {...props}>
        {children}
      </Button>
    </motion.div>
  );
};

export default SmoothButton;
