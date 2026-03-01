import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/store/i18nStore';
import { useNewsStore } from '@/store/newsStore';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  Search,
  LogOut,
  FileText,
  Brain,
  MoreHorizontal,
  Sun,
  Moon,
  Globe,
  Bookmark,
  Crown,
  Shield,
} from 'lucide-react';
import Footer from '@/components/Footer';
import SupportChat from '@/components/SupportChat';
import SearchModal from '@/components/SearchModal';
import { BottomNav } from './BottomNav';
import { SkipLinks } from '@/components/accessibility/skip-links';
import { motion } from 'framer-motion';

type LayoutMode = 'default' | 'full-width' | 'centered' | 'narrow';

interface MainLayoutProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
  layoutMode?: LayoutMode;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
}

const resolveAssetUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${normalized}`;
};

const MainLayout = ({
  children,
  rightSidebar,
  layoutMode = 'default',
  showLeftSidebar,
  showRightSidebar,
}: MainLayoutProps) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useI18n();
  const newsArticles = useNewsStore((state) => state.articles);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const fullWidthRoutes = ['/pricing', '/terms', '/privacy', '/about', '/payment', '/payment/success', '/payment/cancel'];
  const centeredRoutes = ['/login', '/register', '/onboarding'];
  const narrowRoutes = ['/builder', '/interview'];

  const getLayoutMode = (): LayoutMode => {
    const path = location.pathname;

    if (fullWidthRoutes.includes(path)) return 'full-width';
    if (centeredRoutes.includes(path)) return 'centered';
    if (narrowRoutes.includes(path)) return 'narrow';
    return 'default';
  };

  const shouldShowLeftSidebar =
    showLeftSidebar !== undefined
      ? showLeftSidebar
      : ![...fullWidthRoutes, ...centeredRoutes].includes(location.pathname);

  const shouldShowRightSidebar =
    showRightSidebar !== undefined
      ? showRightSidebar
      : ![...fullWidthRoutes, ...centeredRoutes, ...narrowRoutes].includes(location.pathname);

  const finalLayoutMode = layoutMode === 'default' ? getLayoutMode() : layoutMode;
  const isPremium = user?.subscription?.plan === 'premium' && user?.subscription?.status === 'active';

  useEffect(() => {
    if (shouldShowRightSidebar && !rightSidebar) {
      useNewsStore.getState().fetchNews(5);
    }
  }, [shouldShowRightSidebar, rightSidebar]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = profileMenuRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setIsProfileMenuOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProfileMenuOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isProfileMenuOpen]);

  const getMainContentClasses = () => {
    switch (finalLayoutMode) {
      case 'full-width':
        return 'max-w-full';
      case 'centered':
        return 'max-w-2xl mx-auto';
      case 'narrow':
        return 'max-w-5xl mx-auto';
      case 'default':
      default:
        return 'max-w-7xl mx-auto';
    }
  };

  const rightUtilityItems = [
    {
      icon: <Bookmark size={18} className="sm:w-5 sm:h-5" />,
      label: language === 'vi' ? 'Đánh dấu' : 'Bookmarks',
      path: '/bookmarks',
    },
    {
      icon: <Crown size={18} className="sm:w-5 sm:h-5" />,
      label: language === 'vi' ? 'Bảng giá' : 'Pricing',
      path: '/pricing',
    },
    ...(user?.role === 'admin'
      ? [
          {
            icon: <Shield size={18} className="sm:w-5 sm:h-5" />,
            label: language === 'vi' ? 'Quản trị' : 'Admin',
            path: '/admin',
          },
        ]
      : []),
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ease-in-out flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-[#F8F9FA] text-slate-900'}`}>
      <SkipLinks />

      <nav id="navigation" className="hidden md:block glass-nav shadow-sm transition-all duration-300" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-1 min-w-0">
              <button
                type="button"
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-lg text-white font-black text-base sm:text-xl cursor-pointer hover:bg-red-700 transition-colors flex-shrink-0"
                onClick={() => navigate('/dashboard')}
                aria-label="CV Mate home"
              >
                CV
              </button>

              <div
                className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex-1 min-w-0 max-w-md border border-transparent hover:border-red-500 hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 cursor-pointer"
                onClick={() => setIsSearchModalOpen(true)}
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" aria-hidden="true" />
                <span className="bg-transparent text-xs sm:text-sm w-full text-gray-600 dark:text-gray-300 truncate">
                  {`${t('common.search')} jobs, articles, posts...`}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchModalOpen(true)}
                className="sm:hidden flex-shrink-0"
                aria-label={t('common.search')}
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>

            <ul className="flex items-center gap-0.5 sm:gap-1 md:gap-2 h-full flex-shrink-0 overflow-x-auto">
              <NavItem icon={<Home size={18} className="sm:w-5 sm:h-5" />} label={t('nav.home')} active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
              <NavItem icon={<Users size={18} className="sm:w-5 sm:h-5" />} label={t('nav.community')} active={isActive('/community')} onClick={() => navigate('/community')} />
              <NavItem icon={<FileText size={18} className="sm:w-5 sm:h-5" />} label={t('nav.blog')} active={isActive('/blog')} onClick={() => navigate('/blog')} />
              <NavItem icon={<Briefcase size={18} className="sm:w-5 sm:h-5" />} label={t('nav.jobs')} active={isActive('/jobs')} onClick={() => navigate('/jobs')} />
              <NavItem icon={<MessageSquare size={18} className="sm:w-5 sm:h-5" />} label={t('nav.messages')} active={isActive('/messaging')} onClick={() => navigate('/messaging')} />
              <NavItem icon={<Bell size={18} className="sm:w-5 sm:h-5" />} label={t('nav.alerts')} active={isActive('/notifications')} onClick={() => navigate('/notifications')} />

              <li className="relative h-full group">
                <button
                  type="button"
                  className="relative flex flex-col items-center justify-center px-1 sm:px-2 md:px-3 h-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  aria-label={language === 'vi' ? 'Tiện ích khác' : 'More utilities'}
                >
                  <MoreHorizontal size={18} className="sm:w-5 sm:h-5" />
                  <span className="text-[9px] sm:text-[10px] font-medium hidden sm:block mt-1">{language === 'vi' ? 'Khác' : 'More'}</span>
                </button>

                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {rightUtilityItems.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </li>

              <li className="flex items-center justify-center px-1 sm:px-2">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />}
                </button>
              </li>

              <li className="flex items-center justify-center px-1 sm:px-2">
                <button
                  onClick={toggleLanguage}
                  className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
                  aria-label={`Toggle language (${language === 'vi' ? 'VI' : 'EN'})`}
                >
                  <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="text-xs font-medium">{language === 'vi' ? 'VI' : 'EN'}</span>
                </button>
              </li>

              <li className="flex flex-col items-center justify-center border-l border-gray-200 dark:border-gray-700 pl-2 sm:pl-4 ml-1 h-full">
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400 focus-visible:ring-offset-0 transition-all"
                    aria-haspopup="true"
                    aria-expanded={isProfileMenuOpen}
                    aria-label="Profile menu"
                  >
                    {user?.avatar?.trim() ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const fallback = img.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black dark:bg-gray-700 text-white flex items-center justify-center ${user?.avatar?.trim() ? 'hidden' : ''}`}>
                      <span className="font-bold text-xs sm:text-sm">{user?.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                  </button>

                  <div
                    className={`absolute top-full right-0 mt-2 sm:mt-3 w-48 sm:w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-200 z-50 ${
                      isProfileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2 pointer-events-none'
                    }`}
                    role="menu"
                    aria-orientation="vertical"
                    tabIndex={-1}
                  >
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                      <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors text-sm"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('nav.signOut')}
                    </Button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main id="main-content" className={`${getMainContentClasses()} px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 pb-20 md:pb-8 sm:pb-10 lg:pb-12 min-h-[calc(100vh-200px)]`} role="main" tabIndex={-1}>
        {finalLayoutMode === 'default' && (shouldShowLeftSidebar || shouldShowRightSidebar) ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {shouldShowLeftSidebar && (
              <div className="hidden lg:block lg:col-span-3">
                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sticky top-20 lg:top-24 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden flex items-center justify-center shadow-sm flex-shrink-0">
                      {user?.avatar?.trim() ? (
                        <img
                          src={resolveAssetUrl(user.avatar)}
                          className="w-full h-full object-cover"
                          alt="Avatar"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const fallback = img.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={`text-lg font-black text-zinc-900 dark:text-white ${user?.avatar?.trim() ? 'hidden' : 'flex'}`}>
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-bold text-sm text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors truncate"
                        onClick={() => navigate('/profile')}
                      >
                        {user?.name}
                      </h3>
                      <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {user?.careerGoal
                          ? user.careerGoal === 'new-job'
                            ? 'Job Seeker'
                            : user.careerGoal === 'internship'
                            ? 'Intern'
                            : user.careerGoal === 'career-switch'
                            ? 'Career Switcher'
                            : 'Professional'
                          : 'Professional'}
                      </p>
                    </div>
                  </div>

                  {!isPremium && (
                    <Button
                      variant="outline"
                      className="w-full text-xs py-2"
                      onClick={() => navigate('/pricing')}
                    >
                      <Brain size={12} className="mr-1.5" />
                      {language === 'vi' ? 'Nâng cấp Premium' : 'Go Premium'}
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className={`col-span-1 min-w-0 ${shouldShowLeftSidebar && shouldShowRightSidebar ? 'lg:col-span-6' : shouldShowLeftSidebar ? 'lg:col-span-9' : shouldShowRightSidebar ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
              {children}
            </div>

            {shouldShowRightSidebar && (
              <div className="hidden lg:block lg:col-span-3">
                {rightSidebar || (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 sticky top-20 lg:top-24 max-h-[calc(100vh-7rem)] overflow-y-auto mb-6">
                    <div className="flex justify-between items-center mb-4 lg:mb-6">
                      <h3 className="font-bold text-sm lg:text-base text-gray-900 dark:text-white border-l-4 border-red-600 dark:border-red-500 pl-2 lg:pl-3">
                        {t('blog.latestNews')}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/blog')}
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white h-8 w-8 p-0"
                        aria-label={t('dashboard.viewAll')}
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    </div>
                    {newsArticles.length > 0 ? (
                      <>
                        <ul className="space-y-3 lg:space-y-4">
                          {newsArticles.slice(0, 4).map((article, index) => (
                            <NewsItem
                              key={`${article.link}-${index}`}
                              title={article.title}
                              time={new Date(article.pubDate).toLocaleDateString()}
                              link={article.link}
                            />
                          ))}
                        </ul>
                        <Button
                          variant="link"
                          className="mt-3 lg:mt-4 w-full text-zinc-900 dark:text-zinc-100 font-bold hover:text-red-600 dark:hover:text-red-400 p-0 decoration-2 text-sm"
                          onClick={() => navigate('/blog')}
                        >
                          {t('dashboard.viewAll')}
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-6 lg:py-8 text-gray-500 dark:text-gray-400 text-xs lg:text-sm">{t('blog.noNewsAvailable')}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>{children}</div>
        )}
      </main>

      <div className="mt-auto">
        <Footer />
      </div>

      <SupportChat />

      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

      <BottomNav />
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, badge }: { icon: any; label: string; active: boolean; onClick?: () => void; badge?: number }) => (
  <li className="h-full">
    <button
      type="button"
      className={`relative flex flex-col items-center justify-center cursor-pointer px-1 sm:px-2 md:px-3 h-full transition-all duration-200 group ${
        active ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
      }`}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      {active && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-red-600 dark:bg-red-400"
          layoutId="activeIndicator"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      <div className={`p-1 sm:p-1.5 rounded-md group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors relative ${active ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
        <div className="relative">
          {icon}
          {badge && badge > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-crimson-red text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>
      </div>
      <span className="text-[9px] sm:text-[10px] font-medium hidden sm:block mt-0.5 sm:mt-1 truncate max-w-[64px]">{label}</span>
    </button>
  </li>
);

const NewsItem = ({ title, time, link }: { title: string; time: string; link?: string }) => {
  const navigate = useNavigate();

  return (
    <li
      className="cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      onClick={() => {
        if (link) {
          navigate(`/news/${encodeURIComponent(link)}`);
        }
      }}
    >
      <h4 className="font-semibold text-xs lg:text-sm text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
        {title}
      </h4>
      <div className="flex items-center gap-2 mt-1.5">
        <p className="text-[10px] lg:text-xs text-gray-400 dark:text-gray-500">{time}</p>
      </div>
    </li>
  );
};

export default MainLayout;
