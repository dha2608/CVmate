import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout, { resolveAssetUrl } from '@/components/layout/MainLayout';
import { apiRequest, api } from '@/lib/utils';
import {
  Loader2,
  Briefcase,
  FileText,
  MapPin,
  Link2,
  MessageCircle,
  Zap,
  UserPlus,
  UserMinus,
  Eye,
  Trophy,
  MessageSquare,
  Heart,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import FollowListModal from '@/components/FollowListModal';

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
  followersCount?: number;
  followingCount?: number;
  followers?: string[];
  profileViews?: number;
  createdAt?: string;
}

interface UserPost {
  _id: string;
  content: string;
  image?: string;
  likes: string[];
  comments: unknown[];
  createdAt: string;
}

interface UserAchievement {
  _id: string;
  type: string;
  unlockedAt: string;
  metadata?: Record<string, unknown>;
}

const ACHIEVEMENT_META: Record<
  string,
  { label: string; icon: typeof Trophy; color: string; bg: string }
> = {
  first_cv: {
    label: 'CV Đầu Tiên',
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
  },
  complete_profile: {
    label: 'Hoàn Thiện Hồ Sơ',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/30',
  },
  apply_job: {
    label: 'Ứng Tuyển Đầu Tiên',
    icon: Briefcase,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/30',
  },
  write_post: {
    label: 'Bài Viết Đầu Tiên',
    icon: MessageSquare,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/30',
  },
  complete_interview: {
    label: 'Phỏng Vấn Đầu Tiên',
    icon: Award,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/30',
  },
};

type TabType = 'posts' | 'achievements';

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const toast = useToastStore();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Follow list modal
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiRequest<{ success: boolean; data: PublicUser }>(
          `/auth/users/${id}/public`,
          { method: 'GET', requiresAuth: false }
        );
        if (res.success) {
          setUser(res.data);
          setFollowersCount(res.data.followersCount || 0);
          setFollowingCount(res.data.followingCount || 0);
          setIsFollowing(
            currentUser ? (res.data.followers || []).includes(currentUser._id) : false
          );
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
  }, [id, currentUser]);

  // Fetch user posts
  const fetchPosts = useCallback(async () => {
    if (!id) return;
    setPostsLoading(true);
    try {
      const res = await api.getUserPosts(id, 1, 10);
      if (res.success) {
        setPosts(res.data as UserPost[]);
      }
    } catch {
      // silent
    } finally {
      setPostsLoading(false);
    }
  }, [id]);

  // Fetch achievements
  const fetchAchievements = useCallback(async () => {
    if (!id) return;
    setAchievementsLoading(true);
    try {
      const res = await api.getUserAchievements(id);
      if (res.success) {
        setAchievements(res.data);
      }
    } catch {
      // silent
    } finally {
      setAchievementsLoading(false);
    }
  }, [id]);

  // Load tab data on tab change
  useEffect(() => {
    if (activeTab === 'posts' && posts.length === 0) fetchPosts();
    if (activeTab === 'achievements' && achievements.length === 0) fetchAchievements();
  }, [activeTab, fetchPosts, fetchAchievements, posts.length, achievements.length]);

  const handleFollow = async () => {
    if (!currentUser || !user || isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      const res = await api.followUser(user._id);
      if (res.success) {
        setIsFollowing(res.data.isFollowing);
        setFollowersCount(res.data.followersCount);
        setFollowingCount(res.data.followingCount);
      }
    } catch (e: any) {
      toast.error(e.message || 'Không thể thực hiện');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Đã copy link hồ sơ vào clipboard');
    } catch {
      toast.error('Không thể copy link. Vui lòng copy thủ công.');
    }
  };

  const handleMessage = () => {
    if (!currentUser || !user || currentUser._id === user._id) return;
    navigate(`/messaging?user=${user._id}`);
  };

  const openFollowModal = (type: 'followers' | 'following') => {
    setFollowModalType(type);
    setIsFollowModalOpen(true);
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {error || 'User not found'}
          </p>
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
          {/* Cover Photo */}
          <div
            className="h-48 sm:h-56 md:h-64 bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden rounded-t-xl"
            style={
              coverPhotoUrl
                ? {
                    backgroundImage: `url(${coverPhotoUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                  }
                : {}
            }
          >
            {coverPhotoUrl && <div className="absolute inset-0 bg-black/10" />}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-800 to-transparent" />
          </div>

          {/* Header */}
          <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm relative z-10">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[6px] sm:border-8 border-white dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden flex-shrink-0 flex items-center justify-center -mt-16 sm:-mt-20 relative z-20">
                {user.avatar ? (
                  <img
                    src={resolveAssetUrl(user.avatar)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* User Info */}
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

                    {/* Stats row: followers, following, views */}
                    <div className="flex items-center gap-4 text-sm mt-2">
                      <button
                        onClick={() => openFollowModal('followers')}
                        className="hover:underline text-gray-700 dark:text-gray-300"
                      >
                        <span className="font-semibold">{followersCount}</span>{' '}
                        <span className="text-gray-500 dark:text-gray-400">người theo dõi</span>
                      </button>
                      <button
                        onClick={() => openFollowModal('following')}
                        className="hover:underline text-gray-700 dark:text-gray-300"
                      >
                        <span className="font-semibold">{followingCount}</span>{' '}
                        <span className="text-gray-500 dark:text-gray-400">đang theo dõi</span>
                      </button>
                      {(user.profileViews ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Eye className="w-3.5 h-3.5" />
                          {user.profileViews} lượt xem
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row sm:flex-col gap-2 items-start sm:items-end flex-shrink-0">
                    {currentUser && currentUser._id !== user._id && (
                      <button
                        onClick={handleFollow}
                        disabled={isFollowLoading}
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                          isFollowing
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                            : 'bg-crimson-red text-white hover:bg-fire-red'
                        }`}
                      >
                        {isFollowLoading ? (
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        ) : isFollowing ? (
                          <UserMinus className="w-4 h-4 mr-1.5" />
                        ) : (
                          <UserPlus className="w-4 h-4 mr-1.5" />
                        )}
                        {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                      </button>
                    )}
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
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
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
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                        Kinh nghiệm
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {user.yearsOfExperience} năm
                      </p>
                    </div>
                  )}
                  {user.currentRole && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                        Vị trí hiện tại
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {user.currentRole}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills & Industries */}
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

            {/* Social Links */}
            {user.socialLinks &&
              (user.socialLinks.linkedin ||
                user.socialLinks.github ||
                user.socialLinks.portfolio) && (
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

            {/* ── Tabs: Posts | Achievements ── */}
            <div className="mb-6">
              <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-4">
                {[
                  { key: 'posts' as TabType, label: 'Bài viết', icon: MessageSquare },
                  { key: 'achievements' as TabType, label: 'Thành tựu', icon: Trophy },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                      activeTab === tab.key
                        ? 'border-crimson-red text-crimson-red dark:text-red-400 dark:border-red-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div>
                  {postsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-crimson-red" />
                    </div>
                  ) : posts.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                      Chưa có bài viết nào
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {posts.map((post) => (
                        <div
                          key={post._id}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/community#post-${post._id}`)}
                        >
                          <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-3 whitespace-pre-wrap">
                            {post.content}
                          </p>
                          {post.image && (
                            <img
                              src={resolveAssetUrl(post.image)}
                              alt=""
                              className="mt-2 rounded-lg max-h-40 object-cover"
                            />
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5" />
                              {post.likes?.length || 0}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" />
                              {post.comments?.length || 0}
                            </span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div>
                  {achievementsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-crimson-red" />
                    </div>
                  ) : achievements.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                      Chưa có thành tựu nào
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {achievements.map((ach) => {
                        const meta = ACHIEVEMENT_META[ach.type] || {
                          label: ach.type,
                          icon: Trophy,
                          color: 'text-gray-600 dark:text-gray-400',
                          bg: 'bg-gray-50 dark:bg-gray-700/50',
                        };
                        const IconComponent = meta.icon;
                        return (
                          <div
                            key={ach._id}
                            className={`flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${meta.bg}`}
                          >
                            <div className={`p-2.5 rounded-lg ${meta.bg}`}>
                              <IconComponent className={`w-5 h-5 ${meta.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {meta.label}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(ach.unlockedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Follow List Modal */}
      {id && (
        <FollowListModal
          userId={id}
          type={followModalType}
          isOpen={isFollowModalOpen}
          onClose={() => setIsFollowModalOpen(false)}
          title={followModalType === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'}
        />
      )}
    </MainLayout>
  );
};

export default UserProfile;
