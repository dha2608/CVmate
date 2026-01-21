import { create } from 'zustand';

interface User {
  _id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

interface Post {
  _id: string;
  user: User;
  content: string;
  image?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

interface CommunityState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  createPost: (content: string, image?: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  commentPost: (postId: string, text: string) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ posts: data.data, isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createPost: async (content: string, image?: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content, image })
      });
      const data = await res.json();
      if (data.success) {
        set((state) => ({ posts: [data.data, ...state.posts] }));
      }
    } catch (error: any) {
      console.error(error);
    }
  },

  likePost: async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        set((state) => ({
          posts: state.posts.map(post => 
            post._id === postId ? { ...post, likes: data.data } : post
          )
        }));
      }
    } catch (error) {
      console.error(error);
    }
  },

  commentPost: async (postId: string, text: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.success) {
        set((state) => ({
          posts: state.posts.map(post => 
            post._id === postId ? { ...post, comments: data.data } : post
          )
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }
}));
