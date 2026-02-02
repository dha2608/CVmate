import { useState, useId } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';

interface InputFloatingProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const InputFloating = ({
  label,
  error,
  helperText,
  className,
  value,
  ...props
}: InputFloatingProps) => {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.toString().length > 0;

  return (
    <div className="relative">
      <Input
        id={id}
        className={cn(
          "peer pt-6",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-3 transition-all duration-200 pointer-events-none",
          "text-gray-500 dark:text-gray-400",
          (focused || hasValue) 
            ? "top-2 text-xs font-medium" 
            : "top-1/2 -translate-y-1/2 text-sm",
          error && "text-red-500"
        )}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};
