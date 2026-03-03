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
  isLoadingMore: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  sort: 'new' | 'hot' | 'top';
  search: string;
  fetchPosts: () => Promise<void>;
  loadMore: () => Promise<void>;
  setSort: (sort: 'new' | 'hot' | 'top') => void;
  setSearch: (search: string) => void;
  createPost: (content: string, image?: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  commentPost: (postId: string, text: string, parentId?: string) => Promise<void>;
  likeComment: (postId: string, commentId: string) => Promise<void>;
  updateComment: (postId: string, commentId: string, text: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  updatePost: (postId: string, content: string, image?: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
}

const showErrorToast = async (message: string) => {
  const { useToastStore } = await import('@/store/toastStore');
  useToastStore.getState().error(message);
};

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  page: 1,
  hasMore: true,
  sort: 'new',
  search: '',

  setSort: (sort: 'new' | 'hot' | 'top') => {
    set({ sort });
    get().fetchPosts();
  },

  setSearch: (search: string) => {
    set({ search });
    get().fetchPosts();
  },

  fetchPosts: async () => {
    const { sort, search } = get();
    set({ isLoading: true, error: null, page: 1, hasMore: true });
    try {
      const res = await api.getPosts(1, 10, sort, search);
      if (res.success) {
        const posts = (res.data || []) as Post[];
        const hasMore = res.pagination ? res.pagination.page < res.pagination.pages : false;
        set({ posts, isLoading: false, error: null, page: 1, hasMore });
      } else {
        set({ error: (res as any).message || 'Failed to load posts', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to load posts', isLoading: false });
    }
  },

  loadMore: async () => {
    const { isLoadingMore, hasMore, page, sort, search } = get();
    if (isLoadingMore || !hasMore) return;

    const nextPage = page + 1;
    set({ isLoadingMore: true });
    try {
      const res = await api.getPosts(nextPage, 10, sort, search);
      if (res.success) {
        const newPosts = (res.data || []) as Post[];
        const hasMore = res.pagination ? res.pagination.page < res.pagination.pages : false;
        set((state) => ({
          posts: [...state.posts, ...newPosts],
          page: nextPage,
          hasMore,
          isLoadingMore: false,
        }));
      } else {
        set({ isLoadingMore: false });
      }
    } catch {
      set({ isLoadingMore: false });
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
            post._id === postId ? { ...post, likes: (res.data as string[]) || post.likes } : post
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
            post._id === postId
              ? { ...post, comments: (res.data as Comment[]) || post.comments }
              : post
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
            post._id === postId
              ? { ...post, comments: (res.data as Comment[]) || post.comments }
              : post
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
            post._id === postId
              ? { ...post, comments: (res.data as Comment[]) || post.comments }
              : post
          ),
        }));
      }
    } catch (error: any) {
      await showErrorToast(error?.message || 'Không thể xoá bình luận.');
    }
  },

  updatePost: async (postId: string, content: string, image?: string) => {
    try {
      const res = await api.updatePost(postId, content, image);
      if (res.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId ? { ...post, ...(res.data as Post) } : post
          ),
        }));
      }
    } catch (error: any) {
      await showErrorToast(error?.message || 'Không thể cập nhật bài viết.');
    }
  },

  deletePost: async (postId: string) => {
    try {
      const res = await api.deletePost(postId);
      if (res.success) {
        set((state) => ({
          posts: state.posts.filter((post) => post._id !== postId),
        }));
      }
    } catch (error: any) {
      await showErrorToast(error?.message || 'Không thể xoá bài viết.');
    }
  },
}));
