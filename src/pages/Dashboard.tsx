import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useCommunityStore } from '@/store/communityStore';
import { useBlogStore } from '@/store/blogStore';
import { useI18n } from '@/store/i18nStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { 
    FileText, 
    MessageSquare, 
    Plus, 
    Video, 
    TrendingUp,
    Search,
    PenTool,
    ExternalLink
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { stats, fetchStats } = useDashboardStore();
  const { posts, fetchPosts } = useCommunityStore();
  const { articles, fetchArticles } = useBlogStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('dashboard.goodMorning'));
    else if (hour < 18) setGreeting(t('dashboard.goodAfternoon'));
    else setGreeting(t('dashboard.goodEvening'));

    fetchStats();
    fetchPosts();
    fetchArticles();
  }, [user, navigate, t, fetchStats, fetchPosts, fetchArticles]);

  if (!user) return null;

  return (
    <MainLayout>
      <div className="space-y-6">
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
               <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{greeting}, {user.name.split(' ')[0]}!</h1>
                  <p className="text-sm text-gray-500 mt-1">{t('dashboard.readyToBoost')}</p>
               </div>
               <Button variant="ghost" size="icon" className="rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100">
                  <Search size={20} />
               </Button>
            </div>

            <div 
               onClick={() => navigate('/community')}
               className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200/50"
            >
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                  <PenTool size={18} />
               </div>
               <span className="text-gray-500 text-sm font-medium flex-1">{t('dashboard.startPost')}</span>
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickActionCard 
               icon={<FileText className="text-blue-600" size={24} />}
               title={t('dashboard.createCV')}
               desc={t('dashboard.atsFriendly')}
               color="bg-blue-50 hover:bg-blue-100/80 border-blue-100"
               onClick={() => navigate('/builder')}
            />
            <QuickActionCard 
               icon={<Video className="text-green-600" size={24} />}
               title={t('dashboard.interview')}
               desc={t('dashboard.practiceAI')}
               color="bg-green-50 hover:bg-green-100/80 border-green-100"
               onClick={() => navigate('/interview')}
            />
            <QuickActionCard 
               icon={<MessageSquare className="text-orange-600" size={24} />}
               title={t('dashboard.community')}
               desc={t('dashboard.getAdvice')}
               color="bg-orange-50 hover:bg-orange-100/80 border-orange-100"
               onClick={() => navigate('/community')}
            />
            <QuickActionCard 
               icon={<Plus className="text-rose-600" size={24} />}
               title={t('dashboard.article')}
               desc={t('dashboard.shareKnowledge')}
               color="bg-rose-50 hover:bg-rose-100/80 border-rose-100"
               onClick={() => navigate('/blog')}
            />
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
               <TrendingUp size={18} className="text-rose-500" />
               {t('dashboard.yourActivity')}
            </h2>
            <div className="grid grid-cols-3 gap-6 divide-x divide-gray-100">
               <StatItem label={t('dashboard.cvsCreated')} value={stats.resumesCount} color="text-blue-600" />
               <StatItem label={t('dashboard.interviews')} value={stats.interviewsCount} color="text-green-600" />
               <StatItem label={t('dashboard.postViews')} value={stats.postsCount} color="text-orange-600" />
            </div>
         </div>

         <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
               <h2 className="font-bold text-gray-900 dark:text-white">{t('dashboard.recommendedForYou')}</h2>
               <Button 
                 variant="link" 
                 className="text-rose-500 dark:text-rose-400 text-sm p-0 h-auto font-semibold"
                 onClick={() => navigate('/blog')}
               >
                 {t('dashboard.viewAll')}
               </Button>
            </div>

            {articles.length > 0 ? (
              articles.slice(0, 2).map((article) => (
                <RecommendationCard 
                  key={article._id}
                  image={article.image || article.coverImage}
                  title={article.title}
                  author={typeof article.author === 'object' ? article.author?.name || 'Author' : 'Author'}
                  views={article.views ? `${article.views} ${t('blog.views')}` : t('blog.new')}
                  desc={article.summary || article.content?.substring(0, 100) + '...'}
                  onClick={() => navigate(`/blog/${article._id}`)}
                />
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 dark:text-gray-400">{t('blog.noArticlesYet')}</p>
              </div>
            )}
         </div>
      </div>
    </MainLayout>
  );
};

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

const RecommendationCard = ({ image, title, author, views, desc, onClick }: any) => {
  const { t } = useI18n();
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-4 items-start group"
      onClick={onClick}
    >
      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
         {image ? (
           <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
         ) : (
           <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
             <FileText className="w-8 h-8 text-indigo-400" />
           </div>
         )}
      </div>
      <div className="flex-1 min-w-0">
         <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{title}</h3>
         <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">{author}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
            <span>{views}</span>
         </div>
         <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{desc}</p>
         <div className="mt-2 flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
           {t('home.readMore')} <ExternalLink size={12} />
         </div>
      </div>
    </div>
  );
};

export default Dashboard;