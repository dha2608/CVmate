import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout, { resolveAssetUrl } from '@/components/layout/MainLayout';
import { apiRequest } from '@/lib/utils';
import { Loader2, Briefcase, Users, FileText, MapPin, Link2, MessageCircle, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import ActivityFeed from '@/components/ActivityFeed';

interface PublicUser {
  _id: string;
  name: string;
  avatar?: string;
  coverPhoto?: string;
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
  const toast = useToastStore();
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
          requiresAuth: false,
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
      toast.success('Đã copy link hồ sơ vào clipboard');
    } catch {
      toast.error('Không thể copy link. Vui lòng copy thủ công.');
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
  const coverPhotoUrl = user.coverPhoto ? resolveAssetUrl(user.coverPhoto) : null;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-10 px-2 sm:px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
          {/* Cover Photo with proper aspect ratio and positioning */}
          <div 
            className="h-48 sm:h-56 md:h-64 bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden rounded-t-xl"
            style={coverPhotoUrl ? { 
              backgroundImage: `url(${coverPhotoUrl})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              objectFit: 'cover'
            } : {}}
          >
            {coverPhotoUrl && <div className="absolute inset-0 bg-black/10" />}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-800 to-transparent" />
          </div>
          
          {/* Header with shadow separator */}
          <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm relative z-10">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              {/* Avatar with thicker white border */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[6px] sm:border-8 border-white dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden flex-shrink-0 flex items-center justify-center -mt-16 sm:-mt-20 relative z-20">
                {user.avatar ? (
                  <img src={resolveAssetUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* User Info Section */}
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {user.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {careerLabel}
                      </span>
                      {user.location && (
                        <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3.5 h-3.5" /> {user.location}
                        </span>
                      )}
                      {createdDate && (
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                          • Tham gia từ {createdDate}
                        </span>
                      )}
                    </div>
                    {user.headline && (
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium mb-3">
                        {user.headline}
                      </p>
                    )}
                    {(user.yearsOfExperience || user.currentRole) && (
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        {user.yearsOfExperience && (
                          <span className="inline-flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4" />
                            {user.yearsOfExperience} năm kinh nghiệm
                          </span>
                        )}
                        {user.currentRole && (
                          <span className="inline-flex items-center gap-1">
                            <span>•</span>
                            {user.currentRole}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons - aligned with top of info */}
                  <div className="flex flex-row sm:flex-col gap-2 items-start sm:items-end flex-shrink-0">
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
                    >
                      <Link2 className="w-4 h-4 mr-1.5" />
                      Copy link
                    </button>
                    {currentUser && currentUser._id !== user._id && (
                      <button
                        onClick={handleMessage}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-crimson-red text-white hover:bg-fire-red transition-colors shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4 mr-1.5" />
                        Nhắn tin
                      </button>
                    )}
                  </div>
                </div>
                
                {user.bio && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">CV & Bài viết</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Xem các nội dung công khai của {user.name}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex-shrink-0">
                  <Briefcase size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Hoạt động nghề nghiệp</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Theo dõi các bài đăng và job liên quan</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex-shrink-0">
                  <Users size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Kết nối</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Dùng DM trong Community để trò chuyện</p>
                </div>
              </div>
            </div>

            {/* Experience & Role Info */}
            {(user.yearsOfExperience || user.currentRole) && (
              <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-crimson-red dark:text-red-400" />
                  Thông tin nghề nghiệp
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.yearsOfExperience && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Kinh nghiệm</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {user.yearsOfExperience} {user.yearsOfExperience === 1 ? 'năm' : 'năm'}
                      </p>
                    </div>
                  )}
                  {user.currentRole && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Vị trí hiện tại</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {user.currentRole}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills & industries */}
            {(skills.length > 0 || industries.length > 0) && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-crimson-red dark:text-red-400" />
                      Kỹ năng
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-sm font-medium text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {industries.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-crimson-red dark:text-red-400" />
                      Ngành / Lĩnh vực
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {industries.map((ind) => (
                        <span
                          key={ind}
                          className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
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
              <div className="mb-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Liên kết
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.socialLinks.linkedin && (
                    <a
                      href={user.socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors border border-blue-200 dark:border-blue-800"
                    >
                      <Link2 className="w-4 h-4 mr-1.5" />
                      LinkedIn
                    </a>
                  )}
                  {user.socialLinks.github && (
                    <a
                      href={user.socialLinks.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <Link2 className="w-4 h-4 mr-1.5" />
                      GitHub
                    </a>
                  )}
                  {user.socialLinks.portfolio && (
                    <a
                      href={user.socialLinks.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900 transition-colors border border-green-200 dark:border-green-800"
                    >
                      <Link2 className="w-4 h-4 mr-1.5" />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="mb-6">
              <ActivityFeed limit={5} showHeader={true} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;

