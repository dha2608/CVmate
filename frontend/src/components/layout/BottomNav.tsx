import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, FileText, Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useI18n } from '@/store/i18nStore';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, path: '/dashboard', label: t('nav.home') },
    { icon: Users, path: '/community', label: t('nav.community') },
    { icon: FileText, path: '/blog', label: t('nav.blog') },
    { icon: Briefcase, path: '/jobs', label: t('nav.jobs') },
    { icon: User, path: '/profile', label: language === 'vi' ? 'Hồ sơ' : 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md dark:bg-gray-800/95 border-t border-gray-200 dark:border-gray-700 md:hidden safe-area-bottom shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative flex flex-col items-center justify-center flex-1 h-full',
                'transition-colors duration-200',
                'min-w-[44px] min-h-[44px]',
                active ? 'text-crimson-red dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <motion.div
                animate={active ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Icon size={20} />
              </motion.div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-crimson-red dark:bg-red-400"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
