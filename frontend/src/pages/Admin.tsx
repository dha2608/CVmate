import MainLayout from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, FileText, Briefcase } from 'lucide-react';

const Admin = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-6 sm:py-8 lg:py-10 px-2 sm:px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Quản lý người dùng, bài viết và job postings. (Phiên bản demo – có thể mở rộng sau)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <button
              className="card-interactive text-left"
              onClick={() => navigate('/community')}
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-blue-600" size={20} />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Người dùng & Cộng đồng
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Xem hoạt động cộng đồng, bài viết, bình luận. (Hiện dùng cùng giao diện Community)
              </p>
            </button>

            <button
              className="card-interactive text-left"
              onClick={() => navigate('/blog')}
            >
              <div className="flex items-center gap-3 mb-2">
                <FileText className="text-green-600" size={20} />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Bài viết & Blog
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Duyệt và quản lý bài viết trong Career Blog & News.
              </p>
            </button>

            <button
              className="card-interactive text-left"
              onClick={() => navigate('/jobs')}
            >
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="text-purple-600" size={20} />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Job Postings
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Theo dõi các job được đăng, số lượng ứng viên và chất lượng job listing.
              </p>
            </button>
          </div>

          <p className="mt-6 text-[11px] text-gray-400 dark:text-gray-500">
            Gợi ý: để tạo tài khoản admin đầu tiên, hãy đặt trường <code>role</code> của một
            user bất kỳ trong MongoDB thành <code>\"admin\"</code>. Sau đó đăng nhập bằng tài khoản đó.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Admin;

