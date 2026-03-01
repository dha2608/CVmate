import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Briefcase, FileText, MessageSquare, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/store/i18nStore';
import { api } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchResult {
  type: 'job' | 'article' | 'post';
  id: string;
  title: string;
  description?: string;
  metadata?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'articles' | 'posts'>('all');
  const { t } = useI18n();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const searchResults: SearchResult[] = [];

        // Search jobs
        if (activeTab === 'all' || activeTab === 'jobs') {
          try {
            const jobResponse = await api.getJobs({ search: query, limit: 5 });
            if (jobResponse.success && jobResponse.data) {
              jobResponse.data.forEach((job: any) => {
                searchResults.push({
                  type: 'job',
                  id: job._id,
                  title: job.title,
                  description: job.company,
                  metadata: `${job.type} • ${job.location}`,
                });
              });
            }
          } catch (error) {
            console.error('Job search error:', error);
          }
        }

        // Search articles
        if (activeTab === 'all' || activeTab === 'articles') {
          try {
            const articleResponse = await api.getArticles();
            if (articleResponse.success && articleResponse.data) {
              articleResponse.data
                .filter((article: any) =>
                  article.title?.toLowerCase().includes(query.toLowerCase()) ||
                  article.content?.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 5)
                .forEach((article: any) => {
                  searchResults.push({
                    type: 'article',
                    id: article._id,
                    title: article.title,
                    description: article.summary || article.content?.substring(0, 100),
                    metadata: `${article.views || 0} views`,
                  });
                });
            }
          } catch (error) {
            console.error('Article search error:', error);
          }
        }

        // Search posts (from community)
        if (activeTab === 'all' || activeTab === 'posts') {
          try {
            const postsResponse = await api.getPosts();
            if (postsResponse.success && postsResponse.data) {
              postsResponse.data
                .filter((post: any) =>
                  post.content?.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 5)
                .forEach((post: any) => {
                  searchResults.push({
                    type: 'post',
                    id: post._id,
                    title: post.content?.substring(0, 60) + '...',
                    description: typeof post.author === 'object' ? post.author?.name : 'User',
                    metadata: `${post.likes?.length || 0} likes`,
                  });
                });
            }
          } catch (error) {
            console.error('Post search error:', error);
          }
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, activeTab]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'job') {
      navigate(`/jobs`);
      onClose();
    } else if (result.type === 'article') {
      navigate(`/blog/${result.id}`);
      onClose();
    } else if (result.type === 'post') {
      navigate(`/community`);
      onClose();
    }
  };

  // Pure helpers — outside component to prevent recreation on every render
  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'job': return <Briefcase className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'post': return <MessageSquare className="w-4 h-4" />;
    }
  };

  const RESULT_COLORS: Record<SearchResult['type'], string> = {
    job: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    article: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    post: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 max-h-[80vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {t('common.search')}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <Input
              ref={inputRef}
              placeholder={t('common.search') + ' jobs, articles, posts...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 h-12 text-base dark:bg-gray-700 dark:border-gray-600"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onClose();
                }
              }}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {(['all', 'jobs', 'articles', 'posts'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={`text-xs ${activeTab === tab
                  ? 'bg-crimson-red hover:bg-fire-red text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {tab === 'all' ? t('common.all') :
                  tab === 'jobs' ? t('nav.jobs') :
                    tab === 'articles' ? t('nav.blog') :
                      t('nav.community')}
              </Button>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isSearching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3">
                  <Skeleton variant="circular" width={40} height={40} />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="70%" height={20} />
                    <Skeleton variant="text" width="50%" height={16} />
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim().length < 2 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('common.search')} để tìm kiếm jobs, articles, và posts...
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Không tìm thấy kết quả cho "{query}"
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
                >
                  <div className={`p-2 rounded-lg ${RESULT_COLORS[result.type]} flex-shrink-0`}>
                    {getResultIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-crimson-red dark:group-hover:text-red-400 transition-colors line-clamp-1">
                      {result.title}
                    </h4>
                    {result.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                        {result.description}
                      </p>
                    )}
                    {result.metadata && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {result.metadata}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
