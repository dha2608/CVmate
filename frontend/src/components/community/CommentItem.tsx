import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Heart, Reply, Edit2, Trash2, MoreVertical, X } from 'lucide-react';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

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

interface CommentItemProps {
  comment: {
    _id: string;
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    text: string;
    createdAt: string;
    likes?: string[];
    replies?: CommentItemProps['comment'][];
    parentId?: string;
  };
  postId: string;
  onReply?: (commentId: string, text: string) => void;
  onEdit?: (commentId: string, text: string) => void;
  onDelete?: (commentId: string) => void;
  onLike?: (commentId: string) => void;
  depth?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  onReply,
  onEdit,
  onDelete,
  onLike,
  depth = 0,
}) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.text);
  const [showMenu, setShowMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const commentUser = comment?.user ?? null;
  const commentUserId = commentUser?._id;
  const commentUserName = commentUser?.name?.trim() || 'Người dùng';
  const normalizedAvatar = normalizeImageUrl(commentUser?.avatar);

  const isLiked = Array.isArray(comment.likes) ? comment.likes.includes(user?._id || '') : false;
  const isOwner = commentUserId === user?._id;
  const maxDepth = 2;

  const handleReply = () => {
    if (!replyText.trim()) {
      return;
    }
    onReply?.(comment._id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  const handleEdit = () => {
    if (!editText.trim()) {
      return;
    }
    onEdit?.(comment._id, editText);
    setIsEditing(false);
  };

  const confirmDialog = useConfirmDialog();

  const handleDelete = async () => {
    const confirmed = await confirmDialog({
      title: 'Delete Comment',
      description: 'Are you sure you want to delete this comment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (confirmed) {
      onDelete?.(comment._id);
    }
    setShowMenu(false);
  };

  const handleLike = () => {
    onLike?.(comment._id);
  };

  const handleMention = (username: string) => {
    if (isReplying) {
      setReplyText((prev) => prev + `@${username} `);
    }
  };

  return (
    <div
      id={`comment-${comment._id}`}
      className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-3' : ''}`}
    >
      <div className="flex gap-2 group">
        <button
          onClick={() => commentUserId && navigate(`/u/${commentUserId}`)}
          className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs overflow-hidden hover:ring-2 hover:ring-crimson-red transition-all"
        >
          {normalizedAvatar && !avatarError ? (
            <img
              src={normalizedAvatar}
              className="h-full w-full rounded-full object-cover"
              alt={commentUserName}
              onError={() => setAvatarError(true)}
              loading="lazy"
            />
          ) : (
            <span>{commentUserName?.charAt(0)?.toUpperCase() || 'U'}</span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 relative border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => commentUserId && navigate(`/u/${commentUserId}`)}
                  className="text-xs font-bold text-gray-900 dark:text-white hover:text-crimson-red transition-colors"
                >
                  {commentUserName}
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>

              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center gap-2"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm resize-none"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit} className="h-7 text-xs">
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(comment.text);
                    }}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {comment.text.split(' ').map((word, idx) => {
                  if (word.startsWith('@')) {
                    const username = word.slice(1);
                    return (
                      <button
                        key={idx}
                        onClick={() => navigate(`/u/${username}`)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {word}{' '}
                      </button>
                    );
                  }
                  return <span key={idx}>{word} </span>;
                })}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  isLiked
                    ? 'text-crimson-red'
                    : 'text-gray-500 hover:text-crimson-red dark:hover:text-red-400'
                }`}
              >
                <Heart size={12} className={isLiked ? 'fill-current' : ''} />
                <span>{comment.likes?.length || 0}</span>
              </button>

              {depth < maxDepth && (
                <button
                  onClick={() => {
                    setIsReplying(!isReplying);
                    if (!isReplying) {
                      handleMention(commentUserName);
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-crimson-red dark:hover:text-red-300"
                >
                  <Reply size={12} />
                  Reply
                </button>
              )}
            </div>
          </div>

          {isReplying && (
            <div className="mt-2 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${commentUserName}...`}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  className="h-7 text-xs"
                  disabled={!replyText.trim()}
                >
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText('');
                  }}
                  className="h-7 text-xs"
                >
                  <X size={12} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
