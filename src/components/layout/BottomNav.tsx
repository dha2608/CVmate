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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden safe-area-bottom">
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
              aria-label={item.label}
            >
              <Icon size={20} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
