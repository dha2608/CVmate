import { create } from 'zustand';
import { api } from '@/lib/utils';
import type { Post } from '@/types/api';

interface User {
  _id: string;
  name: string;
  avatar?: string;
  careerGoal?: 'new-job' | 'internship' | 'career-switch';
  location?: string;
}

interface Comment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
  updatedAt?: string;
  likes?: string[];
  parentId?: string;
  replies?: Comment[];
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
  commentPost: (postId: string, text: string, parentId?: string) => Promise<void>;
  likeComment: (postId: string, commentId: string) => Promise<void>;
  updateComment: (postId: string, commentId: string, text: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
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
      if (res.success && res.data) {
        const updatedPost = res.data as Post;
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId ? { ...post, likes: updatedPost.likes } : post
          ),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  },

  commentPost: async (postId: string, text: string, parentId?: string) => {
    try {
      const res = await api.commentPost(postId, text, parentId);
      if (res.success && res.data) {
        const updatedPost = res.data as Post;
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId ? { ...post, comments: updatedPost.comments } : post
          ),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  },

  likeComment: async (postId: string, commentId: string) => {
    try {
      const res = await api.likeComment(postId, commentId);
      if (res.success && res.data) {
        const updatedPost = res.data as Post;
        set((state) => ({
          posts: state.posts.map((post) => {
            if (post._id === postId) {
              return { ...post, comments: updatedPost.comments };
            }
            return post;
          }),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  },

  updateComment: async (postId: string, commentId: string, text: string) => {
    try {
      const res = await api.updateComment(postId, commentId, text);
      if (res.success && res.data) {
        const updatedPost = res.data as Post;
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId ? { ...post, comments: updatedPost.comments } : post
          ),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  },

  deleteComment: async (postId: string, commentId: string) => {
    try {
      const res = await api.deleteComment(postId, commentId);
      if (res.success && res.data) {
        const updatedPost = res.data as Post;
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId ? { ...post, comments: updatedPost.comments } : post
          ),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  },
}));
