import { create } from 'zustand';
import { api } from '@/lib/utils';

interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image?: string;
  source: string;
}

interface NewsState {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchNews: (limit?: number) => Promise<void>;
  refreshNews: () => Promise<void>;
}

export const useNewsStore = create<NewsState>((set) => ({
  articles: [],
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchNews: async (limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getNews(limit);
      if (res.success) {
        set({ 
          articles: res.data, 
          isLoading: false, 
          lastFetched: Date.now(),
          error: null 
        });
      } else {
        set({ 
          error: 'Failed to load news', 
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load news', 
        isLoading: false 
      });
    }
  },

  refreshNews: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.refreshNews();
      if (res.success) {
        set({ 
          articles: res.data, 
          isLoading: false, 
          lastFetched: Date.now(),
          error: null 
        });
      } else {
        set({ 
          error: 'Failed to refresh news', 
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to refresh news', 
        isLoading: false 
      });
    }
  },
}));
