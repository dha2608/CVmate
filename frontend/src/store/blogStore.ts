import { create } from 'zustand';
import { api } from '@/lib/utils';

interface Article {
  _id: string;
  title: string;
  content: string;
  category: string;
  summary: string;
  image?: string;
  coverImage?: string;
  createdAt: string;
  author?: {
    _id: string;
    name: string;
    avatar?: string;
  } | string;
  views?: number;
}

interface BlogState {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
  fetchArticles: () => Promise<void>;
  createArticle: (data: any) => Promise<void>;
}

export const useBlogStore = create<BlogState>((set) => ({
  articles: [],
  isLoading: false,
  error: null,

  fetchArticles: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getArticles({ timeout: 15000 });
      if (res.success) {
        set({ articles: res.data as Article[], isLoading: false });
      } else {
        set({ error: (res as any).message || 'Failed to load articles', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error?.message || 'Failed to load articles', isLoading: false, articles: [] });
    }
  },

  createArticle: async (articleData: any) => {
    try {
      // Blog creation uses direct fetch to preserve auth header via apiRequest helper
      const tokenData = localStorage.getItem('user');
      const token = tokenData ? JSON.parse(tokenData).token : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/articles`, {
        method: 'POST',
        headers,
        body: JSON.stringify(articleData),
      });
      const data = await response.json();

      if (data.success) {
        // Refresh articles list to get latest data from server
        const refreshRes = await api.getArticles();
        if (refreshRes.success) {
          set({ articles: refreshRes.data as Article[] });
        } else {
          // Fallback: add to local state
          set((state) => ({ articles: [data.data as Article, ...state.articles] }));
        }
      } else {
        throw new Error(data.message || 'Failed to create article');
      }
    } catch (error) {
      console.error(error);
    }
  },
}));
