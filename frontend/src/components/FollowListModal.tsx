import { memo, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, UserPlus, UserMinus } from 'lucide-react';
import { api } from '@/lib/utils';
import { resolveAssetUrl } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';

interface FollowUser {
  _id: string;
  name: string;
  avatar?: string;
  headline?: string;
  currentRole?: string;
}

interface FollowListModalProps {
  userId: string;
  type: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const FollowListModal = memo(({ userId, type, isOpen, onClose, title }: FollowListModalProps) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetcher = type === 'followers' ? api.getFollowers : api.getFollowing;
      const res = await fetcher(userId, 1, 50);
      if (res.success) {
        setUsers(res.data);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [userId, type]);

  // Load current user's following list to show follow/unfollow state
  useEffect(() => {
    if (!isOpen) return;
    fetchList();

    if (currentUser) {
      api
        .getFollowing(currentUser._id, 1, 200)
        .then((res) => {
          if (res.success) {
            setFollowingSet(new Set(res.data.map((u) => u._id)));
          }
        })
        .catch(() => {});
    }
  }, [isOpen, fetchList, currentUser]);

  const handleFollow = async (targetId: string) => {
    if (!currentUser || loadingFollow) return;
    setLoadingFollow(targetId);
    try {
      const res = await api.followUser(targetId);
      if (res.success) {
        setFollowingSet((prev) => {
          const next = new Set(prev);
          if (res.data.isFollowing) {
            next.add(targetId);
          } else {
            next.delete(targetId);
          }
          return next;
        });
      }
    } catch {
      // silent
    } finally {
      setLoadingFollow(null);
    }
  };

  const handleUserClick = (uid: string) => {
    onClose();
    navigate(`/u/${uid}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-crimson-red" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
              {type === 'followers' ? 'Chưa có người theo dõi' : 'Chưa theo dõi ai'}
            </p>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <button
                  onClick={() => handleUserClick(u._id)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {u.avatar ? (
                      <img
                        src={resolveAssetUrl(u.avatar)}
                        alt={u.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-300">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {u.headline || u.currentRole || ''}
                    </p>
                  </div>
                </button>

                {currentUser && currentUser._id !== u._id && (
                  <button
                    onClick={() => handleFollow(u._id)}
                    disabled={loadingFollow === u._id}
                    className={`flex-shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      followingSet.has(u._id)
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30'
                        : 'bg-crimson-red text-white hover:bg-fire-red'
                    }`}
                  >
                    {loadingFollow === u._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : followingSet.has(u._id) ? (
                      <>
                        <UserMinus className="w-3.5 h-3.5 mr-1" />
                        Bỏ
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                        Theo dõi
                      </>
                    )}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});

FollowListModal.displayName = 'FollowListModal';

export default FollowListModal;
