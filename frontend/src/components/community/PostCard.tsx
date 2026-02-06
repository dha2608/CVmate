import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityStore } from '@/store/communityStore';
import { useAuthStore } from '@/store/authStore';
import { useMessageStore } from '@/store/messageStore';
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
    <div id={`post-${post._id}`} className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-4">
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
      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
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
      <div className="flex items-center justify-between border-t border-gray-100 pt-2">
        <div className="flex gap-4">
            <button 
                onClick={handleLike}
                className={`flex items-center gap-1 text-sm font-medium ${isLiked ? 'text-accent' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <span>{isLiked ? '❤️' : '🤍'}</span>
                <span>{post.likes.length} Likes</span>
            </button>
            <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
                <span>💬</span>
                <span>{post.comments.length} Comments</span>
            </button>
        </div>
        {post.user?._id !== user?._id && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMessage}
            className="text-xs text-gray-600 hover:text-accent border-gray-200 hover:border-accent"
          >
            Nhắn tin
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
