import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";

interface DialogEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
}

interface DialogContentEnhancedProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

interface DialogHeaderEnhancedProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DialogTitleEnhancedProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface DialogFooterEnhancedProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DialogEnhanced = ({ 
  open, 
  onOpenChange, 
  children,
  closeOnBackdrop = true 
}: DialogEnhancedProps) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onOpenChange(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop với blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Dialog Content */}
          <div 
            className="relative z-50 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const DialogContentEnhanced = React.forwardRef<HTMLDivElement, DialogContentEnhancedProps>(
  ({ className, children, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full mx-4'
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700",
          "w-full",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
DialogContentEnhanced.displayName = "DialogContentEnhanced";

export const DialogHeaderEnhanced = React.forwardRef<HTMLDivElement, DialogHeaderEnhancedProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DialogHeaderEnhanced.displayName = "DialogHeaderEnhanced";

export const DialogTitleEnhanced = React.forwardRef<HTMLHeadingElement, DialogTitleEnhancedProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn("text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-white", className)}
        {...props}
      >
        {children}
      </h2>
    );
  }
);
DialogTitleEnhanced.displayName = "DialogTitleEnhanced";

export const DialogDescriptionEnhanced = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
        {...props}
      />
    );
  }
);
DialogDescriptionEnhanced.displayName = "DialogDescriptionEnhanced";

export const DialogFooterEnhanced = React.forwardRef<HTMLDivElement, DialogFooterEnhancedProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4 gap-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DialogFooterEnhanced.displayName = "DialogFooterEnhanced";

export const DialogClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("absolute right-4 top-4 rounded-md opacity-70 hover:opacity-100", className)}
        {...props}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    );
  }
);
DialogClose.displayName = "DialogClose";
