import Parser from 'rss-parser';
import axios from 'axios';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure'],
  },
});

interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image?: string;
  source: string;
}

// RSS Feeds từ các nguồn đáng tin cậy về career/job market
// Sử dụng các nguồn RSS công khai và đáng tin cậy
const RSS_FEEDS = [
  {
    name: 'Harvard Business Review',
    url: 'https://feeds.hbr.org/harvardbusiness',
    source: 'HBR',
  },
  {
    name: 'The Muse Career Advice',
    url: 'https://www.themuse.com/advice/rss',
    source: 'The Muse',
  },
  {
    name: 'Fast Company',
    url: 'https://www.fastcompany.com/feed',
    source: 'Fast Company',
  },
  {
    name: 'Inc.com',
    url: 'https://www.inc.com/rss.xml',
    source: 'Inc.',
  },
];

// Fallback: Sử dụng NewsAPI nếu có API key
const fetchFromNewsAPI = async (apiKey?: string): Promise<NewsArticle[]> => {
  if (!apiKey) return [];

  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'career OR job market OR hiring OR recruitment OR resume OR interview',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey,
      },
    });

    if (response.data.status === 'ok') {
      return response.data.articles.map((article: any) => ({
        title: article.title,
        link: article.url,
        pubDate: article.publishedAt,
        description: article.description || '',
        image: article.urlToImage,
        source: article.source.name,
      }));
    }
  } catch (error) {
    console.error('NewsAPI Error:', error);
  }

  return [];
};

export const fetchCareerNews = async (limit: number = 20): Promise<NewsArticle[]> => {
  const allArticles: NewsArticle[] = [];

  try {
    // Fetch từ RSS feeds với timeout
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        // Set timeout cho mỗi feed (5 seconds)
        const feedData = await Promise.race([
          parser.parseURL(feed.url),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]) as any;
        
        if (feedData?.items && feedData.items.length > 0) {
          const articles = feedData.items.slice(0, 5).map((item: any) => {
            // Extract image from various sources
            let image: string | undefined;
            if (item['media:content']?.['$']?.url) {
              image = item['media:content']['$'].url;
            } else if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
              image = item.enclosure.url;
            } else if (item.contentSnippet?.match(/<img[^>]+src="([^"]+)"/)) {
              const match = item.contentSnippet.match(/<img[^>]+src="([^"]+)"/);
              image = match?.[1];
            } else if (item.content?.match(/<img[^>]+src="([^"]+)"/)) {
              const match = item.content.match(/<img[^>]+src="([^"]+)"/);
              image = match?.[1];
            }

            // Clean description (remove HTML tags)
            let description = item.contentSnippet || item.content || item.description || '';
            description = description.replace(/<[^>]*>/g, '').substring(0, 200);

            return {
              title: item.title || 'Untitled',
              link: item.link || '',
              pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
              description,
              image,
              source: feed.source,
            };
          });

          return articles;
        }
        return [];
      } catch (error) {
        console.error(`Error fetching ${feed.name}:`, error);
        return [];
      }
    });

    // Wait for all feeds with timeout
    const feedResults = await Promise.allSettled(feedPromises);
    feedResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
      }
    });

    // Nếu có NewsAPI key, thêm articles từ đó
    if (process.env.NEWS_API_KEY) {
      const newsApiArticles = await fetchFromNewsAPI(process.env.NEWS_API_KEY);
      allArticles.push(...newsApiArticles);
    }

    // Sort by date (newest first) và limit
    const sortedArticles = allArticles
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, limit);

    return sortedArticles;
  } catch (error) {
    console.error('Error fetching career news:', error);
    throw new Error('Failed to fetch career news');
  }
};

// Cache news articles (refresh every hour)
let cachedNews: NewsArticle[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export const getCachedNews = async (limit: number = 20): Promise<NewsArticle[]> => {
  const now = Date.now();
  
  if (cachedNews.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedNews.slice(0, limit);
  }

  try {
    cachedNews = await fetchCareerNews(limit);
    cacheTimestamp = now;
    return cachedNews;
  } catch (error) {
    // Return cached data even if stale if fetch fails
    if (cachedNews.length > 0) {
      return cachedNews.slice(0, limit);
    }
    throw error;
  }
};
