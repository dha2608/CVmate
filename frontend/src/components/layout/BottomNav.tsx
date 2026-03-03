import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BriefcaseBusiness,
  MessageCircleMore,
  CircleUserRound,
  Ellipsis,
  UsersRound,
  NotebookText,
  Bookmark,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/store/i18nStore';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Close "More" menu on click outside or Escape
  useEffect(() => {
    if (!isMoreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMoreOpen]);

  // Close "More" menu on route change
  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  const primaryItems = [
    { icon: LayoutDashboard, path: '/dashboard', label: t('nav.home') },
    { icon: BriefcaseBusiness, path: '/jobs', label: t('nav.jobs') },
    { icon: MessageCircleMore, path: '/messages', label: t('nav.messages') },
    { icon: CircleUserRound, path: '/profile', label: language === 'vi' ? 'Hồ sơ' : 'Profile' },
  ];

  const moreItems = [
    { icon: UsersRound, path: '/community', label: t('nav.community') },
    { icon: NotebookText, path: '/blog', label: t('nav.blog') },
    { icon: Bookmark, path: '/bookmarks', label: language === 'vi' ? 'Đã lưu' : 'Bookmarks' },
    { icon: Bell, path: '/alerts', label: t('nav.alerts') },
  ];

  const isMoreItemActive = moreItems.some((item) => isActive(item.path));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-800/95 border-t border-gray-200 dark:border-gray-700 md:hidden safe-area-bottom shadow-lg"
      role="navigation"
      aria-label={language === 'vi' ? 'Điều hướng chính' : 'Main navigation'}
    >
      {/* More menu popup */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            ref={moreMenuRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-2 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[180px]"
            role="menu"
          >
            {moreItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMoreOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors',
                    'min-h-[44px]',
                    active
                      ? 'text-crimson-red dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  role="menuitem"
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary nav items + More button */}
      <div className="flex justify-around items-center h-16">
        {primaryItems.map((item) => {
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

        {/* More button */}
        <motion.button
          onClick={() => setIsMoreOpen((prev) => !prev)}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'relative flex flex-col items-center justify-center flex-1 h-full',
            'transition-colors duration-200',
            'min-w-[44px] min-h-[44px]',
            isMoreOpen || isMoreItemActive
              ? 'text-crimson-red dark:text-red-400'
              : 'text-gray-500 dark:text-gray-400'
          )}
          aria-label={language === 'vi' ? 'Thêm' : 'More'}
          aria-expanded={isMoreOpen}
          aria-haspopup="menu"
        >
          <motion.div
            animate={isMoreOpen ? { rotate: 90 } : { rotate: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Ellipsis size={20} />
          </motion.div>
          <span className="text-xs mt-1 font-medium">{language === 'vi' ? 'Thêm' : 'More'}</span>
          {isMoreItemActive && !isMoreOpen && (
            <motion.div
              layoutId="bottomNavIndicator"
              className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-crimson-red dark:bg-red-400"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      </div>
    </nav>
  );
};
