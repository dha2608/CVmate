import { create } from 'zustand';
import { api } from '@/lib/utils';

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

const showErrorToast = async (message: string) => {
  const { useToastStore } = await import('@/store/toastStore');
  useToastStore.getState().error(message);
};

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getPosts();
      if (res.success) {
        set({ posts: (res.data || []) as Post[], isLoading: false, error: null });
      } else {
        set({ error: (res as any).message || 'Failed to load posts', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to load posts', isLoading: false });
    }
  },

  createPost: async (content: string, image?: string) => {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    try {
      const res = await api.createPost(trimmed, image);
      if (res.success) {
        set((state) => ({ posts: [res.data as Post, ...state.posts] }));
      }
    } catch (error: any) {
      await showErrorToast(error?.message || 'Không thể đăng bài.');
    }
  },

  likePost: async (postId: string) => {
    const prev = get().posts;

    try {
      const res = await api.likePost(postId);
      if (res.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId ? { ...post, likes: (res.data as string[]) || post.likes } : post,
          ),
        }));
      }
    } catch (error: any) {
      set({ posts: prev });
      await showErrorToast(error?.message || 'Không thể like bài viết.');
    }
  },

  commentPost: async (postId: string, text: string, parentId?: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    try {
      const res = await api.commentPost(postId, trimmed, parentId);
      if (res.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId ? { ...post, comments: (res.data as Comment[]) || post.comments } : post,
          ),
        }));
      }
    } catch (error: any) {
      await showErrorToast(error?.message || 'Không thể gửi bình luận.');
    }
  },

  likeComment: async (postId: string, commentId: string) => {
    try {
      const res = await api.likeComment(postId, commentId);
      if (res.success) {
        set((state) => ({
          posts: state.posts.map((post) => {
            if (post._id !== postId) {
              return post;
            }

            const updatedComments = post.comments.map((comment) => {
              if (comment._id === commentId) {
                return { ...comment, likes: (res.data as string[]) || comment.likes };
              }
              return comment;
            });

            return { ...post, comments: updatedComments };
          }),
        }));
      }
    } catch (error: any) {
      await showErrorToast(error?.message || 'Không thể like bình luận.');
    }
  },

  updateComment: async (postId: string, commentId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    try {
      const res = await api.updateComment(postId, commentId, trimmed);
      if (res.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId ? { ...post, comments: (res.data as Comment[]) || post.comments } : post,
          ),
        }));
      }
    } catch (error: any) {
      await showErrorToast(error?.message || 'Không thể sửa bình luận.');
    }
  },

  deleteComment: async (postId: string, commentId: string) => {
    try {
      const res = await api.deleteComment(postId, commentId);
      if (res.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId ? { ...post, comments: (res.data as Comment[]) || post.comments } : post,
          ),
        }));
      }
    } catch (error: any) {
      await showErrorToast(error?.message || 'Không thể xoá bình luận.');
    }
  },
}));
