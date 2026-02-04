import { create } from 'zustand';
import { api } from '@/lib/utils';

export interface Bookmark {
  _id: string;
  type: 'job' | 'article';
  itemId: string;
  item: any;
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
      // This would call an API endpoint if available
      // For now, we'll use localStorage as a fallback
      const stored = localStorage.getItem('bookmarks');
      if (stored) {
        set({ bookmarks: JSON.parse(stored), isLoading: false });
      } else {
        set({ bookmarks: [], isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addBookmark: async (type: 'job' | 'article', itemId: string) => {
    try {
      const bookmarks = get().bookmarks;
      const existing = bookmarks.find(
        b => b.type === type && b.itemId === itemId
      );
      
      if (existing) {
        return false; // Already bookmarked
      }

      const newBookmark: Bookmark = {
        _id: `bookmark-${Date.now()}`,
        type,
        itemId,
        item: null, // Will be populated when needed
        createdAt: new Date().toISOString(),
      };

      const updated = [...bookmarks, newBookmark];
      set({ bookmarks: updated });
      localStorage.setItem('bookmarks', JSON.stringify(updated));
      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },

  removeBookmark: async (bookmarkId: string) => {
    try {
      const bookmarks = get().bookmarks;
      const updated = bookmarks.filter(b => b._id !== bookmarkId);
      set({ bookmarks: updated });
      localStorage.setItem('bookmarks', JSON.stringify(updated));
      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },

  isBookmarked: (type: 'job' | 'article', itemId: string) => {
    const bookmarks = get().bookmarks;
    return bookmarks.some(b => b.type === type && b.itemId === itemId);
  },

  getBookmarkId: (type: 'job' | 'article', itemId: string) => {
    const bookmarks = get().bookmarks;
    const bookmark = bookmarks.find(b => b.type === type && b.itemId === itemId);
    return bookmark?._id || null;
  },
}));
