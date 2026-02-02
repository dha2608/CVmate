import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({ 
  className, 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 skeleton-shimmer';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      aria-label="Loading"
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Pre-built skeleton components
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn(
    "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4",
    className
  )}>
    <Skeleton variant="rectangular" height={200} className="w-full rounded-lg" />
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="text" width="40%" />
  </div>
);

export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 64
  };
  return (
    <Skeleton 
      variant="circular" 
      width={sizes[size]} 
      height={sizes[size]}
      className={className}
    />
  );
};
