import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityStore } from '@/store/communityStore';
import { useAuthStore } from '@/store/authStore';
import { useMessageStore } from '@/store/messageStore';
import { useToastStore } from '@/store/toastStore';
import { Button } from '@/components/ui/button';
import { CommentItem } from './CommentItem';
import { MoreHorizontal, Pencil, Trash2, Share2, Link2 } from 'lucide-react';

interface PostCardProps {
  post: any;
}

const normalizeImageUrl = (url: string | undefined | null): string | null => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    return `${baseUrl.replace('/api', '')}/${trimmed.startsWith('/') ? trimmed.slice(1) : trimmed}`;
  }

  return trimmed;
};

const PostCardComponent = ({ post }: PostCardProps) => {
  const { user } = useAuthStore();
  const {
    likePost,
    commentPost,
    likeComment,
    updateComment,
    deleteComment,
    updatePost,
    deletePost,
  } = useCommunityStore();
  const { setActiveConversation } = useMessageStore();
  const toast = useToastStore();
  const navigate = useNavigate();

  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const postUser = post?.user ?? null;
  const postUserId = postUser?._id;
  const postUserName = postUser?.name?.trim() || 'Người dùng';
  const postUserCareerGoal = postUser?.careerGoal;
  const postUserLocation = postUser?.location;
  const isOwner = user?._id === postUserId;

  const normalizedAvatar = normalizeImageUrl(postUser?.avatar);
  const normalizedPostImage = normalizeImageUrl(post?.image);

  const postLikes = Array.isArray(post?.likes) ? post.likes : [];
  const postComments = Array.isArray(post?.comments) ? post.comments : [];
  const isLiked = postLikes.includes(user?._id);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleLike = () => {
    if (!post?._id) {
      return;
    }
    likePost(post._id);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post?._id) {
      return;
    }
    commentPost(post._id, commentText);
    setCommentText('');
  };

  const handleMessage = () => {
    if (!user || !postUserId) {
      return;
    }

    setActiveConversation({
      _id: postUserId,
      name: postUserName,
      avatar: postUser?.avatar,
    });
    navigate('/messaging');
  };

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/community#post-${post?._id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép liên kết bài viết!');
    } catch {
      toast.error('Không thể sao chép liên kết.');
    }
  }, [post?._id, toast]);

  const handleEdit = () => {
    setEditContent(post?.content || '');
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleEditSave = async () => {
    if (!editContent.trim() || !post?._id) return;
    await updatePost(post._id, editContent.trim(), post?.image);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent('');
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const handleDeleteConfirm = async () => {
    if (!post?._id) return;
    await deletePost(post._id);
    setShowDeleteConfirm(false);
  };

  return (
    <div
      id={`post-${post?._id || 'unknown'}`}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4 relative z-0"
    >
      {/* Header */}
      <div className="flex items-center mb-3">
        <button
          className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-crimson-red"
          onClick={() => postUserId && navigate(`/u/${postUserId}`)}
          aria-label={postUserName}
        >
          {normalizedAvatar && !avatarError ? (
            <img
              src={normalizedAvatar}
              className="h-full w-full rounded-full object-cover"
              alt={postUserName}
              loading="lazy"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="text-sm">{postUserName.charAt(0).toUpperCase()}</span>
          )}
        </button>

        <div className="ml-3 flex-1">
          <button
            onClick={() => postUserId && navigate(`/u/${postUserId}`)}
            className="font-semibold text-gray-900 dark:text-gray-100 hover:text-crimson-red transition-colors text-left"
          >
            {postUserName}
          </button>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {postUserCareerGoal === 'new-job'
              ? 'Job Seeker'
              : postUserCareerGoal === 'internship'
                ? 'Intern'
                : postUserCareerGoal === 'career-switch'
                  ? 'Career Switcher'
                  : 'Professional'}
            {postUserLocation ? ` • ${postUserLocation}` : ''}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
          </p>
        </div>

        {/* ⋮ Menu for post owner */}
        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Post options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Pencil className="w-4 h-4" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Xoá bài viết
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content - Editable or Read-only */}
      {isEditing ? (
        <div className="mb-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-crimson-red resize-none min-h-[80px]"
            rows={4}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" onClick={handleEditCancel}>
              Huỷ
            </Button>
            <Button size="sm" onClick={handleEditSave} disabled={!editContent.trim()}>
              Lưu
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 dark:text-gray-100 mb-3 whitespace-pre-wrap">
          {post?.content || ''}
        </p>
      )}

      {normalizedPostImage && !imageError && (
        <div className="w-full mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={normalizedPostImage}
            alt="Post content"
            className="w-full h-auto object-contain max-h-[500px] mx-auto"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-2">
        <div className="flex gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm font-medium ${isLiked ? 'text-crimson-red' : 'text-gray-600 dark:text-gray-300 hover:text-crimson-red'}`}
          >
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{postLikes.length} Likes</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-crimson-red"
          >
            <span>💬</span>
            <span>{postComments.length} Comments</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-500"
            title="Copy link"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
        </div>

        {postUserId !== user?._id && (
          <Button variant="outline" size="sm" onClick={handleMessage} className="text-xs">
            Nhắn tin
          </Button>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">
            Bạn có chắc muốn xoá bài viết này? Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
              Huỷ
            </Button>
            <Button
              size="sm"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xoá
            </Button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
          {postComments
            .filter((c: any) => !c.parentId)
            .map((comment: any) => {
              const replies = postComments.filter((c: any) => c.parentId === comment._id);
              return (
                <CommentItem
                  key={comment._id}
                  comment={{ ...comment, replies }}
                  postId={post._id}
                  onReply={(commentId, text) => {
                    commentPost(post._id, text, commentId);
                  }}
                  onEdit={(commentId, text) => {
                    updateComment(post._id, commentId, text);
                  }}
                  onDelete={(commentId) => {
                    deleteComment(post._id, commentId);
                  }}
                  onLike={(commentId) => {
                    likeComment(post._id, commentId);
                  }}
                />
              );
            })}

          <form onSubmit={handleComment} className="flex gap-2 mt-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-crimson-red"
            />
            <Button type="submit" size="sm" variant="ghost" disabled={!commentText.trim()}>
              Post
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

const PostCard = memo(PostCardComponent);

export default PostCard;
