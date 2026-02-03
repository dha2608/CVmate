import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityStore } from '@/store/communityStore';
import { useAuthStore } from '@/store/authStore';
import { useMessageStore } from '@/store/messageStore';
import { Button } from '@/components/ui/button';

interface PostCardProps {
  post: any;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuthStore();
  const { likePost, commentPost } = useCommunityStore();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();
  const { setActiveConversation } = useMessageStore();

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
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-4">
      {/* Header */}
      <div className="flex items-center mb-3">
        <button
          className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-crimson-red"
          onClick={() => post.user?._id && navigate(`/u/${post.user._id}`)}
          aria-label={post.user.name}
        >
          {post.user.avatar ? (
            <img src={post.user.avatar} className="h-full w-full rounded-full" alt={post.user.name} />
          ) : (
            post.user.name.charAt(0)
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
      {post.image && (
        <img src={post.image} alt="Post content" className="w-full h-auto rounded-lg mb-3 object-cover max-h-96" />
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
        <div className="mt-4 pt-3 border-t border-gray-100">
            {post.comments.map((comment: any) => (
                <div key={comment._id} className="mb-3 flex gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs">
                        {comment.user.name.charAt(0)}
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg flex-1">
                        <p className="text-xs font-bold text-gray-900">{comment.user.name}</p>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                </div>
            ))}
            
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

export default PostCard;
