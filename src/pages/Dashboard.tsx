import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Plus, Video } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <MainLayout>
      {/* "Start a post" / Quick Actions Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex gap-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-100">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{user.name.charAt(0)}</div>}
            </div>
            <button 
                onClick={() => navigate('/community')}
                className="flex-grow text-left px-4 py-3 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
            >
                Start a post, try writing with AI...
            </button>
        </div>
        <div className="flex justify-between items-center px-2 pt-1">
            <ActionButton icon={<FileText size={20} className="text-blue-500" />} label="Create CV" onClick={() => navigate('/builder')} />
            <ActionButton icon={<Video size={20} className="text-green-600" />} label="Interview" onClick={() => navigate('/interview')} />
            <ActionButton icon={<MessageSquare size={20} className="text-orange-500" />} label="Community" onClick={() => navigate('/community')} />
            <ActionButton icon={<Plus size={20} className="text-red-500" />} label="Write Article" onClick={() => navigate('/blog')} />
        </div>
      </div>

      {/* Stats / Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="p-4 border-b border-gray-100">
             <h2 className="text-base font-semibold text-gray-800">Your Dashboard</h2>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4 text-center divide-x divide-gray-100">
             <div>
                <div className="text-2xl font-light text-blue-600">0</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">CVs Created</div>
             </div>
             <div>
                <div className="text-2xl font-light text-green-600">0</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Interviews</div>
             </div>
             <div>
                <div className="text-2xl font-light text-orange-600">0</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Post Views</div>
             </div>
          </div>
      </div>

      {/* Recent Activity / Content Stream */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recommended for you</h3>
            <span className="text-xs text-gray-500">Based on your profile</span>
        </div>
        
        {/* Mock Content Stream Item 1 */}
        <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
            <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded object-cover flex-shrink-0"></div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-800">Top 10 CV Templates for 2024</h4>
                    <p className="text-xs text-gray-500 mb-1">By CV Mate Editorial • 24k viewers</p>
                    <p className="text-sm text-gray-600 line-clamp-2">Discover the latest trends in resume design. ATS-friendly templates are becoming the standard for all industries...</p>
                    <Button variant="link" className="p-0 h-auto text-xs text-gray-500 mt-1">Read more</Button>
                </div>
            </div>
        </div>

        {/* Mock Content Stream Item 2 */}
        <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
            <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded object-cover flex-shrink-0"></div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-800">Mastering the Behavioral Interview</h4>
                    <p className="text-xs text-gray-500 mb-1">By HR Insider • 12k viewers</p>
                    <p className="text-sm text-gray-600 line-clamp-2">The STAR method is your best friend when answering 'Tell me about a time when...' questions. Learn how to apply it effectively.</p>
                    <Button variant="link" className="p-0 h-auto text-xs text-gray-500 mt-1">Read more</Button>
                </div>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

const ActionButton = ({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-3 rounded hover:bg-gray-100 transition-colors"
    >
        {icon}
        <span className="text-sm font-semibold text-gray-600">{label}</span>
    </button>
);

export default Dashboard;
