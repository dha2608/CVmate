import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { 
  Home, Users, Briefcase, MessageSquare, Bell, Search, 
  User as UserIcon, LogOut, FileText, Sparkles, MoreHorizontal, Menu
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
}

const MainLayout = ({ children, rightSidebar }: MainLayoutProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900">
      {/* Navbar: Trắng tinh khôi, shadow nhẹ */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Search */}
            <div className="flex items-center gap-6">
              {/* Logo Đỏ Đen nổi bật */}
              <div 
                className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-lg text-white font-black text-xl cursor-pointer hover:bg-red-700 transition-colors"
                onClick={() => navigate('/dashboard')}
              >
                CV
              </div>
              
              <div className="hidden md:flex items-center bg-gray-100 px-4 py-2 rounded-full w-64 border border-transparent focus-within:border-red-500 focus-within:bg-white transition-all duration-300">
                <Search className="w-4 h-4 text-gray-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 text-gray-900"
                />
              </div>
            </div>

            {/* Nav Icons: Active sẽ màu Đỏ */}
            <ul className="flex items-center gap-1 sm:gap-6 h-full">
              <NavItem icon={<Home size={20} />} label="Home" active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
              <NavItem icon={<Users size={20} />} label="Community" active={isActive('/community')} onClick={() => navigate('/community')} />
              <NavItem icon={<FileText size={20} />} label="Blog" active={isActive('/blog')} onClick={() => navigate('/blog')} />
              <NavItem icon={<Briefcase size={20} />} label="Jobs" active={isActive('/jobs')} onClick={() => navigate('/jobs')} />
              <NavItem icon={<MessageSquare size={20} />} label="Messages" active={isActive('/messaging')} onClick={() => navigate('/messaging')} />
              <NavItem icon={<Bell size={20} />} label="Alerts" active={isActive('/notifications')} onClick={() => navigate('/notifications')} />
              
              {/* Profile Dropdown */}
              <li className="flex flex-col items-center justify-center cursor-pointer border-l border-gray-200 pl-6 ml-2 h-full">
                <div className="group relative">
                    {user?.avatar ? (
                         <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-red-500 transition-all" />
                    ) : (
                         <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                            <span className="font-bold text-sm">{user?.name?.charAt(0)}</span>
                         </div>
                    )}
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover:block p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-3 py-2 border-b border-gray-100 mb-2">
                             <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                             <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
                            onClick={() => { logout(); navigate('/login'); }}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
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
                {/* Header Profile: Màu đen sang trọng */}
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
                    <h3 className="font-bold text-lg text-gray-900 hover:text-red-600 cursor-pointer transition-colors">{user?.name}</h3>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Full Stack Developer</p>
                </div>
                
                <div className="py-4 px-6 border-b border-gray-100">
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                        <span>Profile Views</span>
                        <span className="font-bold text-red-600">128</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Impressions</span>
                        <span className="font-bold text-red-600">4,203</span>
                    </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50 transition-colors">
                    <Button variant="outline" className="w-full border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all">
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

          {/* Right Sidebar (News) */}
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
    </div>
  );
};

// NavItem Component (Red Active State)
const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick?: () => void }) => (
  <li 
    className={`flex flex-col items-center justify-center cursor-pointer px-4 h-full border-b-[3px] transition-all duration-200 group relative ${active ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
    onClick={onClick}
  >
    <div className={`p-1 rounded-md group-hover:bg-gray-100 transition-colors ${active ? 'bg-red-50' : ''}`}>
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