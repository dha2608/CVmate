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

const normalizeImageUrl = (url: string | undefined | null): string | null => {
  if (!url || typeof url !== 'string') {return null;}
  
  const trimmed = url.trim();
  if (!trimmed) {return null;}
  
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
  const { likePost, commentPost, likeComment, updateComment, deleteComment } = useCommunityStore();
  const { setActiveConversation } = useMessageStore();
  const navigate = useNavigate();

  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [imageError, setImageError] = useState(false);

  const postUser = post?.user ?? null;
  const postUserId = postUser?._id;
  const postUserName = postUser?.name?.trim() || 'Người dùng';
  const postUserCareerGoal = postUser?.careerGoal;
  const postUserLocation = postUser?.location;
  
  const normalizedAvatar = normalizeImageUrl(postUser?.avatar);
  const normalizedPostImage = normalizeImageUrl(post?.image);

  const postLikes = Array.isArray(post?.likes) ? post.likes : [];
  const postComments = Array.isArray(post?.comments) ? post.comments : [];
  const isLiked = postLikes.includes(user?._id);

  const handleLike = () => {
    if (!post?._id) {return;}
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

  return (
    <div id={`post-${post?._id || 'unknown'}`} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-4">
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

        <div className="ml-3">
          <button
            onClick={() => postUserId && navigate(`/u/${postUserId}`)}
            className="font-semibold text-gray-900 dark:text-gray-100 hover:text-crimson-red transition-colors text-left"
          >
            {postUserName}
          </button>
          <p className="text-[11px] text-gray-600 dark:text-gray-400">
            {postUserCareerGoal === 'new-job'
              ? 'Job Seeker'
              : postUserCareerGoal === 'internship'
              ? 'Intern'
              : postUserCareerGoal === 'career-switch'
              ? 'Career Switcher'
              : 'Professional'}
            {postUserLocation ? ` • ${postUserLocation}` : ''}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
          </p>
        </div>
      </div>

      <p className="text-gray-800 dark:text-gray-100 mb-3 whitespace-pre-wrap">{post?.content || ''}</p>
      {normalizedPostImage && !imageError && (
        <img 
          src={normalizedPostImage} 
          alt="Post content" 
          className="w-full h-auto rounded-lg mb-3 object-cover max-h-96" 
          loading="lazy"
          onError={() => setImageError(true)}
        />
      )}

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
        </div>

        {postUserId !== user?._id && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMessage}
            className="text-xs"
          >
            Nhắn tin
          </Button>
        )}
      </div>

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
