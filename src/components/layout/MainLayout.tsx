import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/store/i18nStore';
import { useNewsStore } from '@/store/newsStore';
import { Button } from '@/components/ui/button';
import { 
  Home, Users, Briefcase, MessageSquare, Bell, Search, 
  User as UserIcon, LogOut, FileText, Brain, MoreHorizontal, Menu,
  Sun, Moon, Globe, ExternalLink, Bookmark, Crown
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

const MainLayout = ({ 
  children, 
  rightSidebar, 
  layoutMode = 'default',
  showLeftSidebar,
  showRightSidebar
}: MainLayoutProps) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useI18n();
  const { articles: newsArticles, fetchNews } = useNewsStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // Auto-detect layout mode based on route
  const getLayoutMode = (): LayoutMode => {
    const path = location.pathname;
    const fullWidthRoutes = ['/pricing', '/terms', '/privacy', '/about', '/payment', '/payment/success', '/payment/cancel'];
    const centeredRoutes = ['/login', '/register', '/onboarding'];
    const narrowRoutes = ['/builder', '/interview'];
    
    if (fullWidthRoutes.includes(path)) {
      return 'full-width';
    }
    if (centeredRoutes.includes(path)) {
      return 'centered';
    }
    if (narrowRoutes.includes(path)) {
      return 'narrow';
    }
    return 'default';
  };

  // Auto-detect sidebar visibility
  const shouldShowLeftSidebar = showLeftSidebar !== undefined 
    ? showLeftSidebar 
    : !['/pricing', '/terms', '/privacy', '/about', '/payment', '/payment/success', '/payment/cancel', '/login', '/register', '/onboarding'].includes(location.pathname);
  
  const shouldShowRightSidebar = showRightSidebar !== undefined 
    ? showRightSidebar 
    : !['/pricing', '/terms', '/privacy', '/about', '/payment', '/payment/success', '/payment/cancel', '/login', '/register', '/onboarding', '/builder', '/interview'].includes(location.pathname);

  const finalLayoutMode = layoutMode === 'default' ? getLayoutMode() : layoutMode;

  useEffect(() => {
    if (shouldShowRightSidebar && !rightSidebar) {
      fetchNews(5); // Fetch 5 latest news for sidebar
    }
  }, [shouldShowRightSidebar, rightSidebar, fetchNews]);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const onPointerDown = (e: PointerEvent) => {
      const el = profileMenuRef.current;
      if (!el) {
        return;
      }
      if (el.contains(e.target as Node)) {
        return;
      }
      setIsProfileMenuOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isProfileMenuOpen]);

  // Layout classes based on mode
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

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ease-in-out flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-[#F8F9FA] text-slate-900'}`}>
      {/* Skip Links */}
      <SkipLinks />
      
      {/* Navbar*/}
      <nav id="navigation" className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm transition-all duration-300 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            
            {/* Logo & Search */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-1 min-w-0">
              {/* Logo */}
              <div 
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-lg text-white font-black text-base sm:text-xl cursor-pointer hover:bg-red-700 transition-colors flex-shrink-0"
                onClick={() => navigate('/dashboard')}
              >
                CV
              </div>
              
              <div 
                className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full w-full max-w-xs lg:max-w-sm border border-transparent hover:border-red-500 hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 cursor-pointer"
                onClick={() => setIsSearchModalOpen(true)}
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" aria-hidden="true" />
                <span className="bg-transparent text-xs sm:text-sm w-full text-gray-400 dark:text-gray-500">
                  {t('common.search')} jobs, articles, posts...
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

            {/* Nav Icons*/}
            <ul className="flex items-center gap-0.5 sm:gap-1 md:gap-2 lg:gap-4 h-full flex-shrink-0">
              <NavItem icon={<Home size={18} className="sm:w-5 sm:h-5" />} label={t('nav.home')} active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
              <NavItem icon={<Users size={18} className="sm:w-5 sm:h-5" />} label={t('nav.community')} active={isActive('/community')} onClick={() => navigate('/community')} />
              <NavItem icon={<FileText size={18} className="sm:w-5 sm:h-5" />} label={t('nav.blog')} active={isActive('/blog')} onClick={() => navigate('/blog')} />
              <NavItem icon={<Briefcase size={18} className="sm:w-5 sm:h-5" />} label={t('nav.jobs')} active={isActive('/jobs')} onClick={() => navigate('/jobs')} />
              <NavItem icon={<MessageSquare size={18} className="sm:w-5 sm:h-5" />} label={t('nav.messages')} active={isActive('/messaging')} onClick={() => navigate('/messaging')} />
              <NavItem icon={<Bell size={18} className="sm:w-5 sm:h-5" />} label={t('nav.alerts')} active={isActive('/notifications')} onClick={() => navigate('/notifications')} />
              <NavItem icon={<Bookmark size={18} className="sm:w-5 sm:h-5" />} label="Bookmarks" active={isActive('/bookmarks')} onClick={() => navigate('/bookmarks')} />
              
              {/* Pricing Link */}
              <NavItem 
                icon={<Crown size={18} className="sm:w-5 sm:h-5" />} 
                label="Pricing" 
                active={isActive('/pricing')} 
                onClick={() => navigate('/pricing')} 
              />
              
              {/* Theme Toggle */}
              <li className="flex items-center justify-center cursor-pointer px-1 sm:px-2">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />}
                </button>
              </li>
              
              {/* Language Toggle */}
              <li className="flex items-center justify-center cursor-pointer px-1 sm:px-2">
                <button
                  onClick={toggleLanguage}
                  className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
                  aria-label="Toggle language"
                >
                  <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline text-xs font-medium">{language === 'vi' ? 'VI' : 'EN'}</span>
                </button>
              </li>
              
              {/* Profile Dropdown */}
              <li className="flex flex-col items-center justify-center cursor-pointer border-l border-gray-200 dark:border-gray-700 pl-2 sm:pl-4 lg:pl-6 ml-1 sm:ml-2 h-full">
                <div className="relative" ref={profileMenuRef}>
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
                    aria-haspopup="true"
                    aria-expanded={isProfileMenuOpen}
                    aria-label="Profile menu"
                  >
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-transparent hover:border-red-500 transition-all"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black dark:bg-gray-700 text-white flex items-center justify-center border-2 border-transparent hover:border-red-500 transition-all">
                        <span className="font-bold text-xs sm:text-sm">{user?.name?.charAt(0)}</span>
                      </div>
                    )}
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div 
                    className={`absolute top-full right-0 mt-2 sm:mt-3 w-48 sm:w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-200 z-50 ${
                      isProfileMenuOpen 
                        ? 'opacity-100 visible translate-y-0' 
                        : 'opacity-0 invisible translate-y-2 pointer-events-none'
                    }`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
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

      {/* Main Content */}
      <main id="main-content" className={`${getMainContentClasses()} px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 pb-20 md:pb-8 sm:pb-10 lg:pb-12 min-h-[calc(100vh-200px)]`} role="main" tabIndex={-1}>
        {finalLayoutMode === 'default' && (shouldShowLeftSidebar || shouldShowRightSidebar) ? (
          // 3-column layout (with sidebars)
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Sidebar (Profile) */}
            {shouldShowLeftSidebar && (
              <div className="hidden lg:block lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-20 lg:top-24 group mb-6">
                  {/* Header Profile */}
                  <div className="h-20 lg:h-24 bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-gray-900 dark:to-gray-800 relative">
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 overflow-hidden flex items-center justify-center shadow-lg">
                        {user?.avatar ? (
                          <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                        ) : (
                          <span className="text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white">{user?.name?.charAt(0)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-10 lg:pt-12 pb-4 lg:pb-6 px-3 lg:px-4 text-center border-b border-gray-100 dark:border-gray-700">
                    <h3 
                      className="font-bold text-base lg:text-lg text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
                      onClick={() => navigate('/profile')}
                    >
                      {user?.name}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
                      {user?.careerGoal ? 
                        user.careerGoal === 'new-job' ? 'Job Seeker' :
                        user.careerGoal === 'internship' ? 'Intern' :
                        user.careerGoal === 'career-switch' ? 'Career Switcher' : 'Professional'
                      : 'Professional'}
                    </p>
                  </div>
                  
                  <div className="p-3 lg:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <Button 
                      variant="outline" 
                      className="w-full border-zinc-900 dark:border-gray-600 text-zinc-900 dark:text-white hover:bg-zinc-900 dark:hover:bg-gray-600 hover:text-white transition-all text-sm"
                      onClick={() => navigate('/pricing')}
                    >
                      <Brain size={14} className="mr-2" /> 
                      Go Premium
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Center Content */}
            <div className={`col-span-1 min-w-0 ${shouldShowLeftSidebar && shouldShowRightSidebar ? 'lg:col-span-6' : shouldShowLeftSidebar ? 'lg:col-span-9' : shouldShowRightSidebar ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
              {children}
            </div>

            {/* Right Sidebar (News) */}
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
                      <div className="text-center py-6 lg:py-8 text-gray-500 dark:text-gray-400 text-xs lg:text-sm">
                        {t('blog.noNewsAvailable')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Full-width, centered, or narrow layout (no sidebars)
          <div>
            {children}
          </div>
        )}
      </main>

      {/* Footer - Fixed at bottom */}
      <div className="mt-auto">
        <Footer />
      </div>

      {/* Support Chat Widget */}
      <SupportChat />

      {/* Global Search Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNav />
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, badge }: { icon: any, label: string, active: boolean, onClick?: () => void; badge?: number }) => (
  <li 
    className={`relative flex flex-col items-center justify-center cursor-pointer px-1 sm:px-2 md:px-3 lg:px-4 h-full transition-all duration-200 group ${active ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
    onClick={onClick}
    title={label}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    }}
    aria-label={label}
    aria-current={active ? 'page' : undefined}
  >
    {active && (
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-red-600 dark:bg-red-400"
        layoutId="activeIndicator"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
    <span className="text-[9px] sm:text-[10px] font-medium hidden sm:block mt-0.5 sm:mt-1 truncate max-w-[60px]">{label}</span>
  </li>
);

const NewsItem = ({ title, time, link }: { title: string, time: string, link?: string }) => {
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
