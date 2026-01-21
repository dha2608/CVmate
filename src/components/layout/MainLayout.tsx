import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Home, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Bell, 
  Search, 
  User as UserIcon,
  LogOut,
  FileText
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
    <div className="min-h-screen bg-[#F3F2EF] font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-[52px]">
            {/* Logo & Search */}
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center justify-center w-9 h-9 bg-accent rounded text-white font-bold text-xl cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                CV
              </div>
              <div className="hidden md:flex items-center bg-[#EDF3F8] px-3 py-1.5 rounded w-64 transition-all focus-within:w-80 duration-300">
                <Search className="w-4 h-4 text-gray-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500 text-gray-700"
                />
              </div>
            </div>

            {/* Nav Icons */}
            <ul className="flex items-center gap-1 sm:gap-6 h-full">
              <NavItem icon={<Home size={22} />} label="Home" active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
              <NavItem icon={<Users size={22} />} label="Community" active={isActive('/community')} onClick={() => navigate('/community')} />
              <NavItem icon={<FileText size={22} />} label="Blog" active={isActive('/blog')} onClick={() => navigate('/blog')} />
              <NavItem icon={<Briefcase size={22} />} label="Jobs" active={isActive('/jobs')} onClick={() => navigate('/jobs')} />
              <NavItem icon={<MessageSquare size={22} />} label="Messaging" active={isActive('/messaging')} onClick={() => navigate('/messaging')} />
              <NavItem icon={<Bell size={22} />} label="Notifications" active={isActive('/notifications')} onClick={() => navigate('/notifications')} />
              
              <li className="flex flex-col items-center justify-center cursor-pointer border-l pl-6 ml-2 h-full">
                <div className="flex flex-col items-center group relative">
                    {user?.avatar ? (
                         <img src={user.avatar} alt="Profile" className="w-6 h-6 rounded-full" />
                    ) : (
                         <UserIcon size={24} className="text-gray-500" />
                    )}
                    <span className="text-xs text-gray-500 mt-0.5 hidden md:block flex items-center">
                        Me <span className="ml-1">▼</span>
                    </span>
                    
                    {/* Dropdown */}
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 hidden group-hover:block p-2">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
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
      <main className="max-w-7xl mx-auto px-0 md:px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar (Profile) */}
          <div className="hidden md:block col-span-3">
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-20">
                <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 relative">
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                         <div className="w-16 h-16 rounded-full border-2 border-white bg-white overflow-hidden flex items-center justify-center shadow-sm">
                            {user?.avatar ? (
                                <img src={user.avatar} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-gray-400">{user?.name?.charAt(0)}</span>
                            )}
                         </div>
                    </div>
                </div>
                <div className="pt-10 pb-4 px-4 text-center border-b border-gray-200">
                    <h3 className="font-semibold text-lg hover:underline cursor-pointer">{user?.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Software Engineer | Open to work</p>
                </div>
                <div className="py-3 px-4 border-b border-gray-200">
                    <div className="flex justify-between items-center text-xs font-medium text-gray-500 hover:bg-gray-50 p-1 rounded cursor-pointer">
                        <span>Profile viewers</span>
                        <span className="text-accent">12</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium text-gray-500 hover:bg-gray-50 p-1 rounded cursor-pointer">
                        <span>Post impressions</span>
                        <span className="text-accent">48</span>
                    </div>
                </div>
                <div className="p-3 hover:bg-gray-100 cursor-pointer transition-colors text-xs font-semibold text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                    Try Premium for free
                </div>
             </div>
          </div>

          {/* Center Feed */}
          <div className="col-span-12 md:col-span-6">
            {children}
          </div>

          {/* Right Sidebar (Widgets) */}
          <div className="hidden md:block col-span-3">
            {rightSidebar || (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-20">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-sm text-gray-600">CV Mate News</h3>
                        <div className="w-4 h-4 bg-gray-400 rounded-sm text-white flex items-center justify-center text-[10px]">i</div>
                    </div>
                    <ul className="space-y-4">
                        <NewsItem title="Tech hiring stabilizes" time="1d ago" readers="10,934 readers" />
                        <NewsItem title="AI in recruitment" time="12h ago" readers="5,211 readers" />
                        <NewsItem title="Top CV mistakes 2024" time="2h ago" readers="2,099 readers" />
                        <NewsItem title="Remote work trends" time="3d ago" readers="15,442 readers" />
                        <NewsItem title="Salary negotiations" time="5h ago" readers="8,100 readers" />
                    </ul>
                    <Button variant="ghost" className="mt-2 text-sm text-gray-500 font-medium flex items-center gap-1 p-0 hover:bg-transparent hover:text-gray-700">
                        Show more <span className="text-lg">⌄</span>
                    </Button>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick?: () => void }) => (
  <li 
    className={`flex flex-col items-center justify-center cursor-pointer px-2 sm:px-4 h-full border-b-2 transition-colors duration-200 ${active ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
    onClick={onClick}
  >
    {icon}
    <span className="text-[10px] hidden md:block mt-1 font-normal">{label}</span>
  </li>
);

const NewsItem = ({ title, time, readers }: { title: string, time: string, readers: string }) => (
    <li className="cursor-pointer group">
        <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-gray-500 rounded-full group-hover:bg-gray-900"></div>
            <h4 className="font-semibold text-sm text-gray-700 group-hover:text-blue-600 group-hover:underline truncate">{title}</h4>
        </div>
        <div className="pl-3 text-xs text-gray-400">
            {time} • {readers}
        </div>
    </li>
);

export default MainLayout;
