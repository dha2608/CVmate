import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Heart, MessageCircle, Clock, Eye, Send, Trash2, Loader2 } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import ExportShare from '@/components/ExportShare';
import { api } from '@/lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useI18n();
  const toast = useToastStore();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = userData ? JSON.parse(userData).token : null;

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}/articles/${id}`, { headers });
        const data = await res.json();
        if (data.success) {
          setArticle(data.data);
          setLikesCount(data.data.likes?.length || 0);
          const userId = user?._id;
          if (userId && data.data.likes) {
            setIsLiked(data.data.likes.some((l: any) => (l._id || l) === userId));
          }
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchArticle();
    }
  }, [id, user?._id]);

  const handleLike = useCallback(async () => {
    if (!user || !id || isLiking) return;
    setIsLiking(true);
    try {
      const res = await api.likeArticle(id);
      if (res.data) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likes);
      }
    } catch {
      toast.error('Failed to like article');
    } finally {
      setIsLiking(false);
    }
  }, [user, id, isLiking, toast]);

  const handleAddComment = useCallback(async () => {
    if (!user || !id || !commentText.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const res = await api.addArticleComment(id, commentText.trim());
      if (res.data) {
        setArticle((prev: any) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data],
        }));
        setCommentText('');
      }
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  }, [user, id, commentText, isSubmittingComment, toast]);

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!id) return;
      try {
        await api.deleteArticleComment(id, commentId);
        setArticle((prev: any) => ({
          ...prev,
          comments: prev.comments.filter((c: any) => c._id !== commentId),
        }));
      } catch {
        toast.error('Failed to delete comment');
      }
    },
    [id, toast]
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-crimson-red"></div>
          <p className="mt-2 text-sm text-gray-500">Loading article...</p>
        </div>
      </MainLayout>
    );
  }

  if (!article) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Article not found</h2>
          <p className="text-gray-600 mb-4">
            The article you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button
            onClick={() => navigate('/blog')}
            className="bg-crimson-red hover:bg-fire-red text-white"
          >
            Back to Blog
          </Button>
        </div>
      </MainLayout>
    );
  }

  const readTime = estimateReadTime(article.content || '');
  const comments = article.comments || [];

  return (
    <>
      <SEOHead
        title={article.title || 'Article - CV Mate'}
        description={
          article.summary || article.content?.substring(0, 160) || 'Read this article on CV Mate'
        }
      />
      <MainLayout>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
          {(article.image || article.coverImage) && (
            <div className="h-64 w-full relative">
              <img
                src={article.image || article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 bg-white/80 hover:bg-white rounded-full"
                onClick={() => navigate('/blog')}
              >
                <ArrowLeft size={20} />
              </Button>
            </div>
          )}

          <div className="p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1"></div>
                <div className="flex-1 text-center">
                  <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
                    {article.category}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                    {article.title}
                  </h1>
                  <div className="flex items-center justify-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {readTime} min read
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {article.views || 0} {t('blog.views') || 'views'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex justify-end">
                  <ExportShare
                    type="article"
                    data={article}
                    fileName={article.title}
                    shareUrl={window.location.href}
                  />
                </div>
              </div>
            </div>

            {article.summary && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-8 border-l-4 border-accent italic text-gray-700 dark:text-gray-300">
                {article.summary}
              </div>
            )}

            {/* Content */}
            <div
              id="article-content"
              className="prose prose-red max-w-none text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap"
            >
              {article.content}
            </div>

            {/* Like & Comment bar */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  disabled={!user || isLiking}
                  className={`flex items-center gap-2 transition-colors ${
                    isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  } disabled:opacity-50`}
                >
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                  <span className="text-sm font-medium">{likesCount}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageCircle size={20} />
                  <span className="text-sm font-medium">{comments.length}</span>
                </div>
              </div>
            </div>

            {/* Comments section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('blog.comments') || 'Comments'} ({comments.length})
              </h3>

              {/* Add comment input */}
              {user ? (
                <div className="flex gap-3 mb-6">
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                  />
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={t('blog.writeComment') || 'Write a comment...'}
                      className="flex-1 dark:bg-gray-800 dark:border-gray-600"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                      disabled={isSubmittingComment}
                    />
                    <Button
                      size="icon"
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || isSubmittingComment}
                      className="bg-accent hover:bg-red-700 flex-shrink-0"
                    >
                      {isSubmittingComment ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Send size={16} />
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {t('blog.loginToComment') || 'Log in to leave a comment.'}
                </p>
              )}

              {/* Comment list */}
              <div className="space-y-4">
                {comments.length === 0 && (
                  <p className="text-sm text-gray-400 italic">
                    {t('blog.noComments') || 'No comments yet. Be the first to comment!'}
                  </p>
                )}
                {comments.map((comment: any) => (
                  <div key={comment._id} className="flex gap-3 group">
                    <img
                      src={comment.user?.avatar || '/default-avatar.png'}
                      alt={comment.user?.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.user?.name || 'Unknown'}
                          </span>
                          {user?._id === (comment.user?._id || comment.user) && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                          {comment.content}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 ml-3 mt-1 block">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default BlogDetail;
