import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconWrapperProps {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
};

export const IconWrapper = ({ icon: Icon, size = 'md', className }: IconWrapperProps) => {
  return (
    <Icon 
      size={sizeMap[size]} 
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
    />
  );
};

// Icon Size Constants để đảm bảo consistency
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48
} as const;
