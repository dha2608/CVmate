import * as React from "react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Icon Button - Button chỉ có icon
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'size'> {
  icon: React.ReactNode;
  'aria-label': string;
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12'
    };

    return (
      <Button
        ref={ref}
        size="icon"
        className={cn(sizeClasses[size], className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);
IconButton.displayName = "IconButton";

// Floating Action Button (FAB)
export interface FABProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  'aria-label': string;
}

export const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ icon, label, position = 'bottom-right', className, ...props }, ref) => {
    const positionClasses = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6'
    };

    return (
      <motion.button
        {...(props as any)}
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed z-40 h-14 w-14 rounded-full shadow-lg",
          "bg-crimson-red hover:bg-fire-red text-white",
          "flex items-center justify-center",
          "transition-all duration-200",
          positionClasses[position],
          className
        )}
        {...props}
      >
        {icon}
        {label && (
          <span className="sr-only">{label}</span>
        )}
      </motion.button>
    );
  }
);
FAB.displayName = "FAB";

// Button với Ripple Effect
export interface RippleButtonProps extends ButtonProps {
  rippleColor?: string;
}

export const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ children, className, rippleColor = 'rgba(255, 255, 255, 0.6)', onClick, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples(prev => [...prev, { x, y, id }]);

      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id));
      }, 600);

      onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        onClick={handleClick}
        {...props}
      >
        {children}
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: rippleColor,
              width: 0,
              height: 0,
            }}
            animate={{
              width: 200,
              height: 200,
              x: -100,
              y: -100,
              opacity: [0.6, 0],
            }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </Button>
    );
  }
);
RippleButton.displayName = "RippleButton";
