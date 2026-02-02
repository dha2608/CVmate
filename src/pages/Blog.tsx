import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useBlogStore } from '@/store/blogStore';
import { useNewsStore } from '@/store/newsStore';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BookmarkButton from '@/components/BookmarkButton';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { SkeletonCard, SkeletonText } from '@/components/ui/skeleton';
import { PenTool, RefreshCw, ExternalLink, Newspaper, Loader2, Search, Filter, X, ChevronDown } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const Blog = () => {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const toast = useToastStore();
  const { articles, fetchArticles, createArticle, isLoading } = useBlogStore();
  const { articles: newsArticles, fetchNews, refreshNews, isLoading: newsLoading, error: newsError } = useNewsStore();
  const { fetchBookmarks } = useBookmarkStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'blog' | 'news'>('news');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [displayedNewsCount, setDisplayedNewsCount] = useState(15);
  const [displayedArticlesCount, setDisplayedArticlesCount] = useState(10);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tips CV');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }
    fetchArticles();
    fetchNews(30); // Fetch more news articles
    fetchBookmarks();
  }, [user, navigate, fetchArticles, fetchNews, fetchBookmarks]);

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchTerm || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter news
  const filteredNews = newsArticles.filter(article => {
    return !searchTerm || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.description && article.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createArticle({ title, category, content, image });
      setShowCreate(false);
      setTitle('');
      setContent('');
      setImage('');
      toast.success(t('toast.articlePublished'));
      await fetchArticles();
    } catch (error: any) {
      toast.error(error.message || t('toast.articlePublishFailed'));
    }
  };

  if (!user) return null;

  return (
    <>
      <SEOHead 
        title={t('blog.title')} 
        description={t('blog.description')}
      />
      <MainLayout
        rightSidebar={
            <div className="space-y-4 sticky top-20 animate-fade-in">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-300">
                    <h3 className="font-semibold text-gray-900 mb-2">Writing a good article</h3>
                    <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
                        <li>Focus on a specific topic</li>
                        <li>Use clear headings</li>
                        <li>Add a cover image</li>
                        <li>Keep it concise</li>
                    </ul>
                    <Button 
                        onClick={() => setShowCreate(!showCreate)} 
                        className="w-full mt-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-crimson-red hover:text-crimson-red transition-all duration-300"
                        variant="outline"
                    >
                        {showCreate ? 'Cancel' : 'Write an Article'}
                    </Button>
                </div>
            </div>
        }
    >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-black text-jet-black dark:text-white mb-2">{t('blog.title')}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{t('blog.description')}</p>
                </div>
            </div>
            
            {/* Search and Filter */}
            <div className="mb-4 space-y-3">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                        <Input 
                            placeholder={t('blog.searchPlaceholder') || 'Tìm kiếm bài viết...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter size={16} />
                        {t('blog.filters') || 'Lọc'}
                        {selectedCategory !== 'all' && (
                            <span className="bg-crimson-red text-white rounded-full px-2 py-0.5 text-xs">
                                1
                            </span>
                        )}
                    </Button>
                    {(searchTerm || selectedCategory !== 'all') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('all');
                            }}
                            className="text-red-600 dark:text-red-400"
                        >
                            <X size={16} />
                        </Button>
                    )}
                </div>

                {showFilters && activeTab === 'blog' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('blog.category') || 'Danh mục'}
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red"
                        >
                            <option value="all">{t('blog.allCategories') || 'Tất cả'}</option>
                            <option value="Tips CV">Tips CV</option>
                            <option value="Interview Hack">Interview Hack</option>
                            <option value="Market News">Market News</option>
                        </select>
                    </motion.div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('news')}
                    className={`px-6 py-3 font-semibold text-sm transition-all duration-300 border-b-2 ${
                        activeTab === 'news'
                            ? 'border-crimson-red dark:border-red-500 text-crimson-red dark:text-red-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <Newspaper className="inline mr-2" size={16} />
                    {t('blog.latestNews')} ({filteredNews.length})
                </button>
                <button
                    onClick={() => setActiveTab('blog')}
                    className={`px-6 py-3 font-semibold text-sm transition-all duration-300 border-b-2 ${
                        activeTab === 'blog'
                            ? 'border-crimson-red dark:border-red-500 text-crimson-red dark:text-red-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <PenTool className="inline mr-2" size={16} />
                    {t('blog.communityArticles')} ({filteredArticles.length})
                </button>
            </div>
        </div>

        {showCreate && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 animate-scale-in">
                <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-semibold border-b dark:border-gray-700 pb-2">
                    <PenTool size={18} />
                    <h2>{t('blog.createNewArticle')}</h2>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('blog.titleLabel')}</label>
                        <Input 
                          value={title} 
                          onChange={e => setTitle(e.target.value)} 
                          required 
                          placeholder="e.g. 5 Tips for a Perfect CV"
                          className="dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('blog.categoryLabel')}</label>
                            <select 
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md border"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option>Tips CV</option>
                                <option>Interview Hack</option>
                                <option>Market News</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('blog.imageUrlLabel')}</label>
                            <Input 
                              value={image} 
                              onChange={e => setImage(e.target.value)} 
                              placeholder="https://..."
                              className="dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('blog.contentLabel')}</label>
                        <textarea 
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-3 focus:ring-accent focus:border-accent"
                            rows={8}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                            placeholder="Write your article content here..."
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>{t('common.cancel')}</Button>
                        <Button type="submit" className="bg-accent hover:bg-red-700 text-white">{t('blog.publish')}</Button>
                    </div>
                </form>
            </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-jet-black dark:text-white">{t('blog.latestNews')}</h2>
                    <Button
                        onClick={() => refreshNews()}
                        disabled={newsLoading}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={newsLoading ? 'animate-spin' : ''} size={16} />
                        {t('blog.refresh')}
                    </Button>
                </div>

                {newsError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg animate-fade-in">
                        {newsError}
                    </div>
                )}

                {newsLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : newsArticles.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Newspaper className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
                        <p className="text-gray-600 dark:text-gray-400">{t('blog.noNewsAvailable')}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredNews.slice(0, displayedNewsCount).map((article, index) => (
                                <motion.article
                                    key={`${article.link}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                    onClick={() => navigate(`/news/${encodeURIComponent(article.link)}`)}
                                >
                                    {article.image && (
                                        <div className="h-56 w-full overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                                            <OptimizedImage
                                                src={article.image}
                                                alt={article.title}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                            {user && (
                                                <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                                                    <BookmarkButton 
                                                        type="article" 
                                                        itemId={article.link || article.title}
                                                        size="sm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-semibold text-crimson-red dark:text-red-400 uppercase tracking-wider">
                                                {article.source}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {new Date(article.pubDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-jet-black dark:text-white mb-3 leading-tight line-clamp-2 group-hover:text-crimson-red dark:group-hover:text-red-400 transition-colors">
                                            {article.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                            {article.description}
                                        </p>
                                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-crimson-red dark:text-red-400 hover:text-fire-red dark:hover:text-red-500 transition-colors">
                                            {t('blog.readMore')}
                                            <ExternalLink size={14} />
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                        {filteredNews.length > displayedNewsCount && (
                            <div className="text-center mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setDisplayedNewsCount(prev => prev + 9)}
                                    className="flex items-center gap-2 mx-auto"
                                >
                                    {t('blog.loadMore') || 'Tải thêm'}
                                    <ChevronDown size={16} />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        )}

        {/* Blog Tab */}
        {activeTab === 'blog' && (
            <>
                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {articles.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <PenTool className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
                                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('blog.noArticlesYet')}</p>
                                <Button onClick={() => setShowCreate(true)} className="bg-crimson-red hover:bg-fire-red text-white">
                                    {t('blog.writeFirstArticle')}
                                </Button>
                            </div>
                        ) : (
                            <>
                                {filteredArticles.slice(0, displayedArticlesCount).map((article, index) => (
                                    <motion.div 
                                        key={article._id} 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          navigate(`/blog/${article._id}`);
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            navigate(`/blog/${article._id}`);
                                          }
                                        }}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Read article: ${article.title}`}
                                    >
                                        {(article.image || article.coverImage) && (
                                            <div className="h-64 w-full overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                                                <OptimizedImage
                                                    src={article.image || article.coverImage} 
                                                    alt={article.title} 
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                                <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                                                    <BookmarkButton 
                                                        type="article" 
                                                        itemId={article._id}
                                                        size="sm"
                                                    />
                                                </div>
                                            </div>
                                        )}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-accent dark:text-red-400 uppercase tracking-wider">{article.category}</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(article.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{article.title}</h3>
                            
                            {article.summary && (
                                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded mb-3 border-l-2 border-accent/50 dark:border-red-500/50">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 italic line-clamp-2">{article.summary}</p>
                                </div>
                            )}
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">{article.content}</p>
                            
                            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3 mt-2">
                                <div className="flex items-center gap-2">
                                    {article.author && typeof article.author === 'object' && article.author.name ? (
                                      <>
                                        {article.author.avatar ? (
                                          <img 
                                            src={article.author.avatar} 
                                            alt={article.author.name} 
                                            className="w-6 h-6 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-300">
                                            {article.author.name.charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                          {article.author.name}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-300">
                                          A
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Author</span>
                                      </>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      {article.views ? `${article.views} ${t('blog.views')}` : t('blog.new')}
                                    </span>
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <BookmarkButton type="article" itemId={article._id} />
                                    </div>
                                </div>
                            </div>
                                    </div>
                                </motion.div>
                            ))}
                                {filteredArticles.length > displayedArticlesCount && (
                                    <div className="text-center mt-6">
                                        <Button
                                            variant="outline"
                                            onClick={() => setDisplayedArticlesCount(prev => prev + 5)}
                                            className="flex items-center gap-2 mx-auto"
                                        >
                                            {t('blog.loadMore') || 'Tải thêm'}
                                            <ChevronDown size={16} />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </>
        )}
    </MainLayout>
    </>
  );
};

export default Blog;
