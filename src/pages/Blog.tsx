import { useEffect, useState } from 'react';
import { useBlogStore } from '@/store/blogStore';
import { useNewsStore } from '@/store/newsStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonCard, SkeletonText } from '@/components/ui/skeleton';
import { PenTool, RefreshCw, ExternalLink, Newspaper } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const Blog = () => {
  const { user } = useAuthStore();
  const { articles, fetchArticles, createArticle, isLoading } = useBlogStore();
  const { articles: newsArticles, fetchNews, refreshNews, isLoading: newsLoading, error: newsError } = useNewsStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'blog' | 'news'>('news');

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
    fetchNews(15); // Fetch latest 15 news articles
  }, [user, navigate, fetchArticles, fetchNews]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createArticle({ title, category, content, image });
    setShowCreate(false);
    setTitle('');
    setContent('');
    setImage('');
  };

  if (!user) return null;

  return (
    <>
      <SEOHead 
        title="Career Blog & News - CV Mate" 
        description="Latest career insights, job market news, and professional tips. Stay updated with industry trends and expert advice."
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-black text-jet-black mb-2">Career Blog & News</h1>
                    <p className="text-gray-600">Latest insights, tips, and industry news for your professional journey.</p>
                </div>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('news')}
                    className={`px-6 py-3 font-semibold text-sm transition-all duration-300 border-b-2 ${
                        activeTab === 'news'
                            ? 'border-crimson-red text-crimson-red'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Newspaper className="inline mr-2" size={16} />
                    Latest News
                </button>
                <button
                    onClick={() => setActiveTab('blog')}
                    className={`px-6 py-3 font-semibold text-sm transition-all duration-300 border-b-2 ${
                        activeTab === 'blog'
                            ? 'border-crimson-red text-crimson-red'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <PenTool className="inline mr-2" size={16} />
                    Community Articles
                </button>
            </div>
        </div>

        {showCreate && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 animate-scale-in">
                <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold border-b pb-2">
                    <PenTool size={18} />
                    <h2>Create New Article</h2>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. 5 Tips for a Perfect CV" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select 
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md border"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option>Tips CV</option>
                                <option>Interview Hack</option>
                                <option>Market News</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <Input value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-accent focus:border-accent"
                            rows={8}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                            placeholder="Write your article content here..."
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button type="submit" className="bg-accent hover:bg-red-700 text-white">Publish</Button>
                    </div>
                </form>
            </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-jet-black">Latest Career News</h2>
                    <Button
                        onClick={() => refreshNews()}
                        disabled={newsLoading}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={newsLoading ? 'animate-spin' : ''} size={16} />
                        Refresh
                    </Button>
                </div>

                {newsError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
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
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Newspaper className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600">No news available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {newsArticles.map((article, index) => (
                            <article
                                key={`${article.link}-${index}`}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover-lift transition-all duration-300 animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {article.image && (
                                    <div className="h-48 w-full overflow-hidden bg-gray-100">
                                        <img 
                                            src={article.image} 
                                            alt={article.title} 
                                            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-crimson-red uppercase tracking-wider">
                                            {article.source}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(article.pubDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-jet-black mb-3 leading-tight line-clamp-2 hover:text-crimson-red transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                                        {article.description}
                                    </p>
                                    <a
                                        href={article.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-crimson-red hover:text-fire-red transition-colors"
                                    >
                                        Read More
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
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
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <PenTool className="mx-auto text-gray-400 mb-4" size={48} />
                                <p className="text-gray-600 mb-4">No articles yet. Be the first to write one!</p>
                                <Button onClick={() => setShowCreate(true)} className="bg-crimson-red hover:bg-fire-red text-white">
                                    Write First Article
                                </Button>
                            </div>
                        ) : (
                            articles.map((article, index) => (
                                <div 
                                    key={article._id} 
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover-lift transition-all duration-300 cursor-pointer animate-fade-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    onClick={() => navigate(`/blog/${article._id}`)}
                                >
                        {article.image && (
                            <div className="h-48 w-full overflow-hidden">
                                <img src={article.image} alt={article.title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                            </div>
                        )}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-accent uppercase tracking-wider">{article.category}</span>
                                <span className="text-xs text-gray-400">{new Date(article.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight hover:text-blue-600 transition-colors">{article.title}</h3>
                            
                            {article.summary && (
                                <div className="bg-gray-50 p-3 rounded mb-3 border-l-2 border-accent/50">
                                    <p className="text-xs text-gray-600 italic line-clamp-2">{article.summary}</p>
                                </div>
                            )}
                            
                            <p className="text-sm text-gray-600 line-clamp-3 mb-3">{article.content}</p>
                            
                            <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                                        A
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">Author Name</span>
                                </div>
                                <span className="text-xs text-gray-400">3 min read</span>
                            </div>
                                    </div>
                                </div>
                            ))
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
