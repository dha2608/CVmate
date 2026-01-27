import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useCommunityStore } from '@/store/communityStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { 
    FileText, 
    MessageSquare, 
    Plus, 
    Video, 
    TrendingUp,
    Search,
    PenTool
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { stats, fetchStats } = useDashboardStore();
  const { posts, fetchPosts } = useCommunityStore();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchStats();
    fetchPosts();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <MainLayout>
      {/* Chỉ giữ lại wrapper cho cột giữa, bỏ Grid tổng */}
      <div className="space-y-6">
             
         {/* 1. Welcome & Post Input Section */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
               <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{greeting}, {user.name.split(' ')[0]}!</h1>
                  <p className="text-sm text-gray-500 mt-1">Ready to boost your career today?</p>
               </div>
               <Button variant="ghost" size="icon" className="rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100">
                  <Search size={20} />
               </Button>
            </div>

            {/* Input giả lập để viết bài */}
            <div 
               onClick={() => navigate('/community')}
               className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200/50"
            >
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                  <PenTool size={18} />
               </div>
               <span className="text-gray-500 text-sm font-medium flex-1">Start a post, try writing with AI...</span>
            </div>
         </div>

         {/* 2. Quick Actions (Hành động nhanh) */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickActionCard 
               icon={<FileText className="text-blue-600" size={24} />}
               title="Create CV"
               desc="ATS-Friendly"
               color="bg-blue-50 hover:bg-blue-100/80 border-blue-100"
               onClick={() => navigate('/builder')}
            />
            <QuickActionCard 
               icon={<Video className="text-green-600" size={24} />}
               title="Interview"
               desc="Practice AI"
               color="bg-green-50 hover:bg-green-100/80 border-green-100"
               onClick={() => navigate('/interview')}
            />
            <QuickActionCard 
               icon={<MessageSquare className="text-orange-600" size={24} />}
               title="Community"
               desc="Get Advice"
               color="bg-orange-50 hover:bg-orange-100/80 border-orange-100"
               onClick={() => navigate('/community')}
            />
            <QuickActionCard 
               icon={<Plus className="text-rose-600" size={24} />}
               title="Article"
               desc="Share Knowledge"
               color="bg-rose-50 hover:bg-rose-100/80 border-rose-100"
               onClick={() => navigate('/blog')}
            />
         </div>

         {/* 3. Dashboard Stats (Thống kê) */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
               <TrendingUp size={18} className="text-rose-500" />
               Your Activity
            </h2>
            <div className="grid grid-cols-3 gap-6 divide-x divide-gray-100">
               <StatItem label="CVs Created" value={stats.resumesCount} color="text-blue-600" />
               <StatItem label="Interviews" value={stats.interviewsCount} color="text-green-600" />
               <StatItem label="Post Views" value={stats.postsCount} color="text-orange-600" />
            </div>
         </div>

         {/* 4. Recommended Feed */}
         <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
               <h2 className="font-bold text-gray-900">Recommended for you</h2>
               <Button variant="link" className="text-rose-500 text-sm p-0 h-auto font-semibold">View all</Button>
            </div>

            <RecommendationCard 
               image="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=300&h=200"
               title="Top 10 CV Templates for 2024"
               author="CV Mate Editorial"
               views="24k"
               desc="Discover the latest trends in resume design. ATS-friendly templates are becoming the standard..."
            />
            
            <RecommendationCard 
               image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=200"
               title="Mastering the Behavioral Interview"
               author="HR Insider"
               views="12k"
               desc="The STAR method is your best friend when answering 'Tell me about a time when...' questions."
            />
         </div>
      </div>
    </MainLayout>
  );
};

// Sub-components
const QuickActionCard = ({ icon, title, desc, color, onClick }: any) => (
   <div 
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col items-center text-center gap-2 ${color}`}
   >
      <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
         {icon}
      </div>
      <div>
         <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
         <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
   </div>
);

const StatItem = ({ label, value, color }: any) => (
   <div className="text-center">
      <div className={`text-3xl font-black ${color} mb-1`}>{value}</div>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
   </div>
);

const RecommendationCard = ({ image, title, author, views, desc }: any) => (
   <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex gap-4 items-start">
      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
         <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
         <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 hover:text-rose-600 transition-colors">{title}</h3>
         <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
            <span className="font-medium text-gray-700">{author}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>{views} viewers</span>
         </div>
         <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{desc}</p>
      </div>
   </div>
);

export default Dashboard;