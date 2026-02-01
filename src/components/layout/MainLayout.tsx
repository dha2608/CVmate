import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/store/i18nStore';
import { Button } from '@/components/ui/button';
import { 
  Home, Users, Briefcase, MessageSquare, Bell, Search, 
  User as UserIcon, LogOut, FileText, Sparkles, MoreHorizontal, Menu,
  Sun, Moon, Globe
} from 'lucide-react';
import Footer from '@/components/Footer';
import SupportChat from '@/components/SupportChat';

interface MainLayoutProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
}

const MainLayout = ({ children, rightSidebar }: MainLayoutProps) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-[#F8F9FA] text-slate-900'}`}>
      {/* Navbar*/}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Search */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div 
                className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-lg text-white font-black text-xl cursor-pointer hover:bg-red-700 transition-colors"
                onClick={() => navigate('/dashboard')}
              >
                CV
              </div>
              
              <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full w-64 border border-transparent focus-within:border-red-500 focus-within:bg-white dark:focus-within:bg-gray-600 transition-all duration-300">
                <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder={t('common.search')} 
                  className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Nav Icons*/}
            <ul className="flex items-center gap-1 sm:gap-6 h-full">
              <NavItem icon={<Home size={20} />} label={t('nav.home')} active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
              <NavItem icon={<Users size={20} />} label={t('nav.community')} active={isActive('/community')} onClick={() => navigate('/community')} />
              <NavItem icon={<FileText size={20} />} label={t('nav.blog')} active={isActive('/blog')} onClick={() => navigate('/blog')} />
              <NavItem icon={<Briefcase size={20} />} label={t('nav.jobs')} active={isActive('/jobs')} onClick={() => navigate('/jobs')} />
              <NavItem icon={<MessageSquare size={20} />} label={t('nav.messages')} active={isActive('/messaging')} onClick={() => navigate('/messaging')} />
              <NavItem icon={<Bell size={20} />} label={t('nav.alerts')} active={isActive('/notifications')} onClick={() => navigate('/notifications')} />
              
              {/* Theme Toggle */}
              <li className="flex items-center justify-center cursor-pointer px-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </li>
              
              {/* Language Toggle */}
              <li className="flex items-center justify-center cursor-pointer px-2">
                <button
                  onClick={toggleLanguage}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle language"
                >
                  <Globe size={18} />
                  <span className="ml-1 text-xs font-medium">{language === 'vi' ? 'VI' : 'EN'}</span>
                </button>
              </li>
              
              {/* Profile Dropdown */}
              <li className="flex flex-col items-center justify-center cursor-pointer border-l border-gray-200 pl-6 ml-2 h-full">
                <div className="relative" ref={profileMenuRef}>
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-haspopup="true"
                    aria-expanded={isProfileMenuOpen}
                    aria-label="Profile menu"
                  >
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent hover:ring-red-500 transition-all"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                        <span className="font-bold text-sm">{user?.name?.charAt(0)}</span>
                      </div>
                    )}
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div 
                    className={`absolute top-full right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-200 z-50 ${
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
                      <p className="font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
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

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-0 md:px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          
          {/* Left Sidebar (Profile) */}
          <div className="hidden md:block col-span-3">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24 group">
                {/* Header Profile */}
                <div className="h-24 bg-zinc-900 relative">
                   <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                        <div className="w-20 h-20 rounded-full border-4 border-white bg-white overflow-hidden flex items-center justify-center shadow-md">
                           {user?.avatar ? (
                               <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                           ) : (
                               <span className="text-3xl font-black text-zinc-900">{user?.name?.charAt(0)}</span>
                           )}
                        </div>
                   </div>
                </div>
                
                <div className="pt-12 pb-6 px-4 text-center border-b border-gray-100">
                    <h3 
                      className="font-bold text-lg text-gray-900 hover:text-red-600 cursor-pointer transition-colors"
                      onClick={() => navigate('/profile')}
                    >
                      {user?.name}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                      {user?.careerGoal ? 
                        user.careerGoal === 'new-job' ? 'Job Seeker' :
                        user.careerGoal === 'internship' ? 'Intern' :
                        user.careerGoal === 'career-switch' ? 'Career Switcher' : 'Professional'
                      : 'Professional'}
                    </p>
                </div>
                
                <div className="p-4 hover:bg-gray-50 transition-colors">
                    <Button 
                      variant="outline" 
                      className="w-full border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all"
                      onClick={() => navigate('/profile')}
                    >
                        <Sparkles size={16} className="mr-2" /> 
                        Go Premium
                    </Button>
                </div>
             </div>
          </div>

          {/* Center Feed */}
          <div className="col-span-12 md:col-span-6">
            {children}
          </div>

          {/* News */}
          <div className="hidden md:block col-span-3">
            {rightSidebar || (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-base text-gray-900 border-l-4 border-red-600 pl-3">Trending News</h3>
                        <MoreHorizontal size={16} className="text-gray-400 cursor-pointer hover:text-black" />
                    </div>
                    <ul className="space-y-5">
                        <NewsItem title="Tech layoffs: How to survive & thrive" time="2h ago" />
                        <NewsItem title="The rise of AI in Resume Screening" time="4h ago" />
                        <NewsItem title="Remote work is here to stay" time="1d ago" />
                        <NewsItem title="Top 10 skills for 2026" time="2d ago" />
                    </ul>
                    <Button variant="link" className="mt-4 w-full text-zinc-900 font-bold hover:text-red-600 p-0 decoration-2">
                        View all updates
                    </Button>
                </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Support Chat Widget */}
      <SupportChat />
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick?: () => void }) => (
  <li 
    className={`flex flex-col items-center justify-center cursor-pointer px-4 h-full border-b-[3px] transition-all duration-200 group relative ${active ? 'border-red-600 text-red-600 dark:text-red-500' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
    onClick={onClick}
  >
    <div className={`p-1 rounded-md group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors ${active ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
        {icon}
    </div>
    <span className="text-[10px] font-medium hidden md:block mt-1">{label}</span>
  </li>
);

const NewsItem = ({ title, time }: { title: string, time: string }) => (
    <li className="cursor-pointer group">
        <h4 className="font-semibold text-sm text-gray-800 group-hover:text-red-600 transition-colors leading-snug">
            {title}
        </h4>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
    </li>
);

export default MainLayout;