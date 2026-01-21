import { create } from 'zustand';

interface Article {
  _id: string;
  title: string;
  content: string;
  category: string;
  summary: string;
  image?: string;
  createdAt: string;
}

interface BlogState {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
  fetchArticles: () => Promise<void>;
  createArticle: (data: any) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useBlogStore = create<BlogState>((set) => ({
  articles: [],
  isLoading: false,
  error: null,

  fetchArticles: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/articles`);
      const data = await res.json();
      if (data.success) {
        set({ articles: data.data, isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createArticle: async (articleData: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(articleData)
      });
      const data = await res.json();
      if (data.success) {
        set((state) => ({ articles: [data.data, ...state.articles] }));
      }
    } catch (error) {
      console.error(error);
    }
  }
}));
