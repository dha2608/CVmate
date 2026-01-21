import { useState } from 'react';
import { useCommunityStore } from '@/store/communityStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

interface PostCardProps {
  post: any;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuthStore();
  const { likePost, commentPost } = useCommunityStore();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const isLiked = post.likes.includes(user?._id);

  const handleLike = () => {
    likePost(post._id);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentPost(post._id, commentText);
    setCommentText('');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-4">
      {/* Header */}
      <div className="flex items-center mb-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
          {post.user.avatar ? <img src={post.user.avatar} className="h-full w-full rounded-full" /> : post.user.name.charAt(0)}
        </div>
        <div className="ml-3">
          <p className="font-semibold text-gray-900">{post.user.name}</p>
          <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
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
