import { create } from 'zustand';
import { bookmarkApi } from '@/lib/apiClient';

export interface Bookmark {
  _id: string;
  type: 'job' | 'article';
  itemId: string;
  createdAt: string;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;

  fetchBookmarks: () => Promise<void>;
  addBookmark: (type: 'job' | 'article', itemId: string) => Promise<boolean>;
  removeBookmark: (bookmarkId: string) => Promise<boolean>;
  isBookmarked: (type: 'job' | 'article', itemId: string) => boolean;
  getBookmarkId: (type: 'job' | 'article', itemId: string) => string | null;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  isLoading: false,
  error: null,

  fetchBookmarks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookmarkApi.getBookmarks();
      const bookmarks = (response.data || []).map((b: any) => ({
        _id: b._id,
        type: b.type,
        itemId: b.itemId,
        createdAt: b.createdAt,
      }));
      set({ bookmarks, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addBookmark: async (type: 'job' | 'article', itemId: string) => {
    try {
      const bookmarks = get().bookmarks;
      const existing = bookmarks.find((b) => b.type === type && b.itemId === itemId);
      if (existing) return false;

      const response = await bookmarkApi.addBookmark(type, itemId);
      if (response.success && response.data) {
        const newBookmark: Bookmark = {
          _id: response.data._id,
          type: response.data.type,
          itemId: response.data.itemId,
          createdAt: response.data.createdAt,
        };
        set({ bookmarks: [...bookmarks, newBookmark] });
        return true;
      }
      return false;
    } catch (error: any) {
      // 409 = already bookmarked, not a real error
      if (error.status === 409) return false;
      set({ error: error.message });
      return false;
    }
  },

  removeBookmark: async (bookmarkId: string) => {
    try {
      await bookmarkApi.removeBookmark(bookmarkId);
      const bookmarks = get().bookmarks;
      set({ bookmarks: bookmarks.filter((b) => b._id !== bookmarkId) });
      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },

  isBookmarked: (type: 'job' | 'article', itemId: string) => {
    return get().bookmarks.some((b) => b.type === type && b.itemId === itemId);
  },

  getBookmarkId: (type: 'job' | 'article', itemId: string) => {
    const bookmark = get().bookmarks.find((b) => b.type === type && b.itemId === itemId);
    return bookmark?._id || null;
  },
}));
