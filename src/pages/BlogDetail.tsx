import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/articles/${id}`);
            const data = await res.json();
            if (data.success) {
                setArticle(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetchArticle();
  }, [id]);

  if (loading) return <MainLayout><div className="text-center py-10">Loading...</div></MainLayout>;
  if (!article) return <MainLayout><div className="text-center py-10">Article not found</div></MainLayout>;

  return (
    <MainLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {article.image && (
                <div className="h-64 w-full relative">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
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
                    <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
                        {article.category}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{article.title}</h1>
                    <p className="text-gray-500 text-sm">
                        Published on {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                </div>

                {article.summary && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-8 border-l-4 border-accent italic text-gray-700">
                        {article.summary}
                    </div>
                )}

                <div className="prose prose-red max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {article.content}
                </div>
            </div>
        </div>
    </MainLayout>
  );
};

export default BlogDetail;
