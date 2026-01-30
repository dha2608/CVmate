import { create } from 'zustand';
import { api } from '@/lib/utils';

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

export const useCommunityStore = create<CommunityState>((set) => ({
  posts: [],
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      const res = await api.getPosts();
      if (res.success) {
        set({ posts: res.data as Post[], isLoading: false });
      } else {
        set({ error: (res as any).message || 'Failed to load posts', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createPost: async (content: string, image?: string) => {
    try {
      const res = await api.createPost(content, image);
      if (res.success) {
        set((state) => ({ posts: [res.data as Post, ...state.posts] }));
      }
    } catch (error: any) {
      console.error(error);
    }
  },

  likePost: async (postId: string) => {
    try {
      const res = await api.likePost(postId);
      if (res.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId ? { ...post, likes: res.data as string[] } : post
          ),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  },

  commentPost: async (postId: string, text: string) => {
    try {
      const res = await api.commentPost(postId, text);
      if (res.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId ? { ...post, comments: res.data as Comment[] } : post
          ),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  },
}));
