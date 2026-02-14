import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityStore } from '@/store/communityStore';
import { useAuthStore } from '@/store/authStore';
import { useMessageStore } from '@/store/messageStore';
import { useI18n } from '@/store/i18nStore';
import { Button } from '@/components/ui/button';
import { CommentItem } from './CommentItem';

interface PostCardProps {
  post: any;
}

// Normalize CDN image URLs and provide fallback
const normalizeImageUrl = (url: string | undefined | null): string | null => {
  if (!url || typeof url !== 'string') return null;
  
  const trimmed = url.trim();
  if (!trimmed) return null;
  
  // If already a full URL, return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // If relative path, assume it's from uploads folder
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    return `${baseUrl.replace('/api', '')}/${trimmed.startsWith('/') ? trimmed.slice(1) : trimmed}`;
  }
  
  // Return as is if it looks like a valid URL pattern
  return trimmed;
};

const PostCardComponent = ({ post }: PostCardProps) => {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const { likePost, commentPost, likeComment, updateComment, deleteComment } = useCommunityStore();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const { setActiveConversation } = useMessageStore();
  
  const normalizedAvatar = normalizeImageUrl(post.user?.avatar);
  const normalizedPostImage = normalizeImageUrl(post.image);

  const isLiked = post.likes.includes(user?._id);

  const handleLike = () => {
    likePost(post._id);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      return;
    }
    commentPost(post._id, commentText);
    setCommentText('');
  };

  const handleMessage = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để nhắn tin.');
      return;
    }
    if (!post.user?._id) return;
    setActiveConversation({
      _id: post.user._id,
      name: post.user.name,
      avatar: post.user.avatar,
    });
    navigate('/messaging');
  };

  return (
    <div id={`post-${post._id}`} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
      {/* Header */}
      <div className="flex items-center mb-3">
        <button
          className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-crimson-red"
          onClick={() => post.user?._id && navigate(`/u/${post.user._id}`)}
          aria-label={post.user.name}
        >
          {normalizedAvatar && !avatarError ? (
            <img 
              src={normalizedAvatar} 
              className="h-full w-full rounded-full object-cover" 
              alt={post.user.name} 
              loading="lazy"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="text-sm">{post.user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          )}
        </button>
        <div className="ml-3">
          <button
            onClick={() => post.user?._id && navigate(`/u/${post.user._id}`)}
            className="font-semibold text-gray-900 hover:text-crimson-red transition-colors text-left"
          >
            {post.user.name}
          </button>
          <p className="text-[11px] text-gray-500">
            {post.user.careerGoal === 'new-job'
              ? 'Job Seeker'
              : post.user.careerGoal === 'internship'
              ? 'Intern'
              : post.user.careerGoal === 'career-switch'
              ? 'Career Switcher'
              : 'Professional'}
            {post.user.location && ` • ${post.user.location}`}
          </p>
          <p className="text-[11px] text-gray-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed">{post.content}</p>
      </div>
      {normalizedPostImage && !imageError && (
        <img 
          src={normalizedPostImage} 
          alt="Post content" 
          className="w-full h-auto rounded-lg mb-3 object-cover max-h-96" 
          loading="lazy"
          onError={() => setImageError(true)}
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mt-4">
        <div className="flex gap-4 sm:gap-6">
            <button 
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isLiked 
                    ? 'text-crimson-red dark:text-red-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
                <span className="text-base">{isLiked ? '❤️' : '🤍'}</span>
                <span>{post.likes.length} {t('community.likes') || 'Likes'}</span>
            </button>
            <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
                <span className="text-base">💬</span>
                <span>{post.comments.length} {t('community.comments') || 'Comments'}</span>
            </button>
        </div>
        {post.user?._id !== user?._id && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMessage}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-crimson-red dark:hover:text-red-400 border-gray-200 dark:border-gray-600 hover:border-crimson-red dark:hover:border-red-400"
          >
            {t('community.message') || 'Nhắn tin'}
          </Button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
            {post.comments
              .filter((c: any) => !c.parentId)
              .map((comment: any) => {
                const replies = post.comments.filter((c: any) => c.parentId === comment._id);
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
                    className="flex-1 border border-gray-300 rounded-full px-3 py-1 text-sm focus:outline-none focus:border-accent"
                />
                <Button type="submit" size="sm" variant="ghost" className="text-accent" disabled={!commentText.trim()}>
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
