import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-secondary">CV Mate</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              <Button onClick={() => { logout(); navigate('/login'); }} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
             {/* Stats cards will go here */}
             <div className="bg-white overflow-hidden shadow rounded-lg p-5 border border-gray-200">
                <dt className="text-sm font-medium text-gray-500 truncate">Total CVs</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
             </div>
             <div className="bg-white overflow-hidden shadow rounded-lg p-5 border border-gray-200">
                <dt className="text-sm font-medium text-gray-500 truncate">Interviews</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
             </div>
             <div className="bg-white overflow-hidden shadow rounded-lg p-5 border border-gray-200">
                <dt className="text-sm font-medium text-gray-500 truncate">Saved Posts</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
             </div>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Button 
                    onClick={() => navigate('/builder')}
                    className="h-24 text-lg bg-white border border-gray-200 hover:bg-gray-50 text-secondary flex flex-col items-center justify-center gap-2 shadow-sm" 
                    variant="outline"
                >
                    <span>Create New CV</span>
                    <span className="text-xs text-gray-500 font-normal">AI Powered</span>
                </Button>
                <Button 
                    onClick={() => navigate('/interview')}
                    className="h-24 text-lg bg-white border border-gray-200 hover:bg-gray-50 text-secondary flex flex-col items-center justify-center gap-2 shadow-sm" 
                    variant="outline"
                >
                    <span>Practice Interview</span>
                    <span className="text-xs text-gray-500 font-normal">Start Simulation</span>
                </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
