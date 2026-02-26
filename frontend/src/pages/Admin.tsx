import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, FileText, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/utils';
import { useToastStore } from '@/store/toastStore';

const Admin = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToastStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Career');
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateArticle = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung.');
      return;
    }

    setCreating(true);
    try {
      const res = await api.createArticle({
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || 'Career',
        image: image.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.message || 'Không thể tạo bài viết');
      }

      toast.success('Tạo bài viết thành công.');
      setTitle('');
      setCategory('Career');
      setImage('');
      setContent('');
    } catch (error: any) {
      toast.error(error?.message || 'Không thể tạo bài viết.');
    } finally {
      setCreating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-6 sm:py-8 lg:py-10 px-2 sm:px-4 space-y-6">
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
                Quản lý người dùng, bài viết và job postings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <button className="card-interactive text-left" onClick={() => navigate('/community')}>
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-blue-600" size={20} />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Người dùng & Cộng đồng</h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Xem hoạt động cộng đồng, bài viết, bình luận.</p>
            </button>

            <button className="card-interactive text-left" onClick={() => navigate('/blog')}>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="text-green-600" size={20} />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Bài viết & Blog</h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Duyệt và quản lý bài viết trong Career Blog & News.</p>
            </button>

            <button className="card-interactive text-left" onClick={() => navigate('/jobs')}>
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="text-purple-600" size={20} />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Job Postings</h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Theo dõi các job được đăng và chất lượng job listing.</p>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 lg:p-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tạo bài viết mới (CMS)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Tiêu đề</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề bài viết" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Danh mục</label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Career" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Ảnh bìa URL (tuỳ chọn)</label>
            <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Nội dung</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết nội dung bài viết..."
              className="min-h-[180px]"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreateArticle} disabled={creating} className="bg-crimson-red hover:bg-fire-red text-white">
              {creating ? 'Đang tạo...' : 'Tạo bài viết'}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Admin;
