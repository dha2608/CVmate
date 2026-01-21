import { useEffect, useState } from 'react';
import { useBlogStore } from '@/store/blogStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PenTool } from 'lucide-react';

const Blog = () => {
  const { user } = useAuthStore();
  const { articles, fetchArticles, createArticle, isLoading } = useBlogStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

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
  }, [user, navigate, fetchArticles]);

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
    <MainLayout
        rightSidebar={
            <div className="space-y-4 sticky top-20">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Writing a good article</h3>
                    <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
                        <li>Focus on a specific topic</li>
                        <li>Use clear headings</li>
                        <li>Add a cover image</li>
                        <li>Keep it concise</li>
                    </ul>
                    <Button 
                        onClick={() => setShowCreate(!showCreate)} 
                        className="w-full mt-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        variant="outline"
                    >
                        {showCreate ? 'Cancel' : 'Write an Article'}
                    </Button>
                </div>
            </div>
        }
    >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h1 className="text-xl font-bold text-gray-900">Career Blog</h1>
            <p className="text-sm text-gray-500">Insights, tips, and news for your professional journey.</p>
        </div>

        {showCreate && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
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

        {isLoading ? (
            <div className="text-center py-10">
                 <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                 <p className="mt-2 text-sm text-gray-500">Loading articles...</p>
            </div>
        ) : (
            <div className="space-y-4">
                {articles.map((article) => (
                    <div key={article._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
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
                ))}
            </div>
        )}
    </MainLayout>
  );
};

export default Blog;
