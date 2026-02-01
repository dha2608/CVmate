import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNewsStore } from '@/store/newsStore';
import { useI18n } from '@/store/i18nStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const NewsDetail = () => {
  const { link } = useParams<{ link: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { articles, fetchNews } = useNewsStore();
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      if (!link) return;
      
      setIsLoading(true);
      
      // Decode the link parameter
      const decodedLink = decodeURIComponent(link);
      
      // First try to find in existing articles
      let found = articles.find((a: any) => a.link === decodedLink);
      
      if (!found) {
        // If not found, fetch fresh articles
        await fetchNews(50);
        // Get fresh articles from store after fetch
        const { articles: freshArticles } = useNewsStore.getState();
        found = freshArticles.find((a: any) => a.link === decodedLink);
      }
      
      if (found) {
        setArticle(found);
      }
      
      setIsLoading(false);
    };

    loadArticle();
  }, [link]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-crimson-red" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!article) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/blog')}
            className="mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t('common.back')}
          </Button>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('blog.articleNotFound') || 'Article not found'}
            </h1>
            <Button onClick={() => navigate('/blog')}>
              {t('blog.backToBlog') || 'Back to Blog'}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <SEOHead 
        title={article.title} 
        description={article.description}
      />
      <MainLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/blog')}
            className="mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t('common.back')}
          </Button>

          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {article.image && (
              <div className="w-full h-96 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-crimson-red dark:text-red-400 uppercase tracking-wider">
                  {article.source}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar size={16} />
                  <span>{new Date(article.pubDate).toLocaleDateString()}</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-jet-black dark:text-white mb-6 leading-tight">
                {article.title}
              </h1>

              <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {article.description}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-crimson-red dark:text-red-400 hover:text-fire-red dark:hover:text-red-500 transition-colors"
                >
                  {t('blog.readFullArticle') || 'Read full article on source'} 
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </article>
        </div>
      </MainLayout>
    </>
  );
};

export default NewsDetail;
