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
  const baseClasses = 'animate-pulse bg-gray-200';
  
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
    />
  );
};

// Pre-built skeleton components
export const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
    <Skeleton variant="rectangular" height={200} className="w-full rounded-lg" />
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="text" width="40%" />
  </div>
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 40 }: { size?: number }) => (
  <Skeleton variant="circular" width={size} height={size} />
);
