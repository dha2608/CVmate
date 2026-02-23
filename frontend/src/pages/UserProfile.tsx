import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { apiRequest } from '@/lib/utils';
import { Loader2, Briefcase, Users, FileText, MapPin, Link2, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface PublicUser {
  _id: string;
  name: string;
  avatar?: string;
  bio?: string;
  headline?: string;
  location?: string;
  yearsOfExperience?: number;
  currentRole?: string;
  industries?: string[];
  skills?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  careerGoal?: 'new-job' | 'internship' | 'career-switch';
  createdAt?: string;
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {return;}
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiRequest<{ success: boolean; data: PublicUser }>(`/auth/users/${id}/public`, {
          method: 'GET',
          requiresAuth: true,
        });
        if (res.success) {
          setUser(res.data);
        } else {
          setError('User not found');
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      alert('Đã copy link hồ sơ vào clipboard');
    } catch {
      alert('Không thể copy link. Vui lòng copy thủ công.');
    }
  };

  const handleMessage = () => {
    if (!currentUser || !user) {return;}
    if (currentUser._id === user._id) {return;}
    navigate(`/messaging?user=${user._id}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-6 h-6 animate-spin text-crimson-red" />
        </div>
      </MainLayout>
    );
  }

  if (error || !user) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{error || 'User not found'}</p>
        </div>
      </MainLayout>
    );
  }

  const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : null;
  const careerLabel =
    user.careerGoal === 'new-job'
      ? 'Job Seeker'
      : user.careerGoal === 'internship'
      ? 'Intern'
      : user.careerGoal === 'career-switch'
      ? 'Career Switcher'
      : 'Professional';

  const skills = user.skills || [];
  const industries = user.industries || [];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-10 px-2 sm:px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="h-28 sm:h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
          <div className="px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14 pb-6 sm:pb-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-indigo-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {user.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-[11px] sm:text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    {careerLabel}
                  </span>
                  {user.location && (
                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3" /> {user.location}
                    </span>
                  )}
                  {createdDate && (
                    <span className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">
                      • Tham gia từ {createdDate}
                    </span>
                  )}
                </p>
                {user.headline && (
                  <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 font-medium">
                    {user.headline}
                  </p>
                )}
                {user.bio && (
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {user.bio}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 items-stretch sm:items-end w-full sm:w-auto">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5 mr-1" />
                  Copy profile link
                </button>
                {currentUser && currentUser._id !== user._id && (
                  <button
                    onClick={handleMessage}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium bg-crimson-red text-white hover:bg-fire-red transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1" />
                    Nhắn tin
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-2 text-xs sm:text-sm">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">CV & Bài viết</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px]">Xem các nội dung công khai của {user.name}</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-2 text-xs sm:text-sm">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                  <Briefcase size={16} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">Hoạt động nghề nghiệp</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px]">Theo dõi các bài đăng và job liên quan</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-2 text-xs sm:text-sm">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                  <Users size={16} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">Kết nối</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px]">Dùng DM trong Community để trò chuyện</p>
                </div>
              </div>
            </div>

            {/* Skills & industries */}
            {(skills.length > 0 || industries.length > 0) && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      Kỹ năng
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-[11px] sm:text-xs text-indigo-700 dark:text-indigo-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {industries.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      Ngành / Lĩnh vực
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {industries.map((ind) => (
                        <span
                          key={ind}
                          className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-[11px] sm:text-xs text-gray-800 dark:text-gray-100"
                        >
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social links */}
            {user.socialLinks && (user.socialLinks.linkedin || user.socialLinks.github || user.socialLinks.portfolio) && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Liên kết
                </h2>
                <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                  {user.socialLinks.linkedin && (
                    <a
                      href={user.socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5 mr-1" />
                      LinkedIn
                    </a>
                  )}
                  {user.socialLinks.github && (
                    <a
                      href={user.socialLinks.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5 mr-1" />
                      GitHub
                    </a>
                  )}
                  {user.socialLinks.portfolio && (
                    <a
                      href={user.socialLinks.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5 mr-1" />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;

