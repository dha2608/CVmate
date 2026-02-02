import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

export interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    children, 
    loading = false, 
    icon, 
    iconPosition = 'left',
    className,
    disabled,
    ...props 
  }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          "transition-all duration-200",
          "hover:scale-[1.02] active:scale-[0.98]",
          loading && "cursor-wait",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center bg-inherit">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
        )}
        <span className={cn("flex items-center gap-2", loading && "invisible")}>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </span>
      </Button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";
