# 🛠️ Hướng Dẫn Triển Khai UI/UX Improvements

## 🚀 Quick Start - Các Component Cải Tiến

### 1. Enhanced Button Component

```tsx
// src/components/ui/button-enhanced.tsx
import { Button } from './button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const EnhancedButton = ({
  children,
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}: EnhancedButtonProps) => {
  return (
    <Button
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
};
```

### 2. Skeleton Loader Component

```tsx
// src/components/ui/skeleton-enhanced.tsx
import { cn } from '@/lib/utils';

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn(
    "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6",
    "animate-pulse",
    className
  )}>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
);

export const SkeletonAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  return (
    <div className={cn(
      "rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse",
      sizes[size]
    )} />
  );
};

export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse",
          i === lines - 1 && "w-3/4"
        )}
      />
    ))}
  </div>
);
```

### 3. Empty State Component

```tsx
// src/components/ui/empty-state.tsx
import { Button } from './button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
```

### 4. Enhanced Navigation Item

```tsx
// src/components/layout/NavItemEnhanced.tsx
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavItemEnhancedProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
  badge?: number;
}

export const NavItemEnhanced = ({
  icon,
  label,
  active,
  onClick,
  badge
}: NavItemEnhancedProps) => {
  return (
    <li
      className={cn(
        "relative flex flex-col items-center justify-center cursor-pointer px-2 h-full",
        "transition-all duration-200",
        active ? "text-crimson-red dark:text-red-400" : "text-gray-500 dark:text-gray-400"
      )}
      onClick={onClick}
    >
      {active && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-crimson-red dark:bg-red-400"
          layoutId="activeIndicator"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <div className={cn(
        "p-1.5 rounded-md transition-colors",
        active ? "bg-red-50 dark:bg-red-900/20" : "hover:bg-gray-100 dark:hover:bg-gray-700"
      )}>
        <div className="relative">
          {icon}
          {badge && badge > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-crimson-red text-white text-xs rounded-full flex items-center justify-center">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>
      </div>
      <span className="text-[10px] font-medium mt-0.5 hidden sm:block truncate max-w-[60px]">
        {label}
      </span>
    </li>
  );
};
```

### 5. Toast Notification Enhanced

```tsx
// src/components/ui/toast-enhanced.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastEnhancedProps {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertCircle
};

const colors = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
};

export const ToastEnhanced = ({
  id,
  type,
  message,
  description,
  action,
  onClose,
  duration = 5000
}: ToastEnhancedProps) => {
  const Icon = icons[type];

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={cn(
        "min-w-[300px] max-w-md p-4 rounded-lg border shadow-lg",
        colors[type]
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{message}</p>
          {description && (
            <p className="text-xs mt-1 opacity-90">{description}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-xs font-semibold underline"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
```

### 6. Loading Overlay Component

```tsx
// src/components/ui/loading-overlay.tsx
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay = ({
  isLoading,
  message = 'Loading...',
  fullScreen = false
}: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
        fullScreen ? "fixed" : "absolute"
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-crimson-red" />
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        )}
      </div>
    </motion.div>
  );
};
```

### 7. Form Input với Floating Label

```tsx
// src/components/ui/input-floating.tsx
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
          "peer",
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
            ? "top-1 text-xs" 
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
```

### 8. Card với Hover Effects

```tsx
// src/components/ui/card-enhanced.tsx
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardEnhancedProps {
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CardEnhanced = ({
  children,
  hover = false,
  onClick,
  className
}: CardEnhancedProps) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700",
        "p-6 shadow-sm transition-all duration-300",
        hover && "hover:shadow-lg hover:border-crimson-red dark:hover:border-red-500",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
```

---

## 🎨 CSS Utilities Mới

```css
/* src/styles/ui-enhancements.css */

/* Smooth transitions */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover lift effect */
.hover-lift {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Focus ring */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-crimson-red focus:ring-offset-2;
}

/* Glass morphism */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Gradient text */
.gradient-text {
  @apply bg-gradient-to-r from-crimson-red to-fire-red bg-clip-text text-transparent;
}

/* Skeleton shimmer */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 50%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

---

## 📱 Mobile Enhancements

### Bottom Navigation (Mobile)

```tsx
// src/components/layout/BottomNav.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, FileText, Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, path: '/dashboard', label: 'Home' },
    { icon: Users, path: '/community', label: 'Community' },
    { icon: FileText, path: '/blog', label: 'Blog' },
    { icon: Briefcase, path: '/jobs', label: 'Jobs' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full",
                "transition-colors duration-200",
                active
                  ? "text-crimson-red dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
```

---

## 🎯 Implementation Checklist

### Week 1
- [ ] Tạo enhanced button component
- [ ] Tạo skeleton loaders
- [ ] Tạo empty state component
- [ ] Cải thiện navigation active states
- [ ] Thêm loading states cho forms

### Week 2
- [ ] Tạo toast notification system
- [ ] Tạo loading overlay
- [ ] Cải thiện error handling UI
- [ ] Thêm floating labels cho inputs
- [ ] Cải thiện card components

### Week 3
- [ ] Implement bottom navigation (mobile)
- [ ] Thêm swipe gestures
- [ ] Optimize mobile performance
- [ ] Cải thiện touch targets

### Week 4
- [ ] Accessibility audit
- [ ] Keyboard navigation
- [ ] Screen reader optimization
- [ ] Final polish

---

## 📚 Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)

---

**Note:** Bắt đầu với Quick Wins, sau đó implement từng phase theo plan.
