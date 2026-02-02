import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import ExportShare from '@/components/ExportShare';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

            const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
              headers
            });
            const data = await res.json();
            if (data.success) {
                setArticle(data.data);
            } else {
                console.error('Failed to load article:', data.message);
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
  }, [id]);

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
          <p className="text-gray-600 mb-4">The article you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/blog')} className="bg-crimson-red hover:bg-fire-red text-white">
            Back to Blog
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <SEOHead 
        title={article.title || 'Article - CV Mate'} 
        description={article.summary || article.content?.substring(0, 160) || 'Read this article on CV Mate'}
      />
      <MainLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
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
                <div className="mb-6 text-center">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1"></div>
                        <div className="flex-1 text-center">
                    <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
                        {article.category}
                    </span>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{article.title}</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Published on {new Date(article.createdAt).toLocaleDateString()}
                    </p>
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
                    <div className="bg-gray-50 p-4 rounded-lg mb-8 border-l-4 border-accent italic text-gray-700">
                        {article.summary}
                    </div>
                )}

                <div id="article-content" className="prose prose-red max-w-none text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {article.content}
                </div>
            </div>
        </div>
      </MainLayout>
    </>
  );
};

export default BlogDetail;
