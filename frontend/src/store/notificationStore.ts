import { create } from 'zustand';
import { api } from '@/lib/utils';

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  type: 'like' | 'comment' | 'job' | 'system' | 'connection' | 'security';
  message: string;
  link?: string;
  relatedId?: string; // ID of post, job, etc.
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await api.getNotifications();
      if (response.success) {
        interface NotificationData {
          read?: boolean;
          isRead?: boolean;
          [key: string]: unknown;
        }
        const unread = (response.data as NotificationData[]).filter((n) => !(n.read ?? n.isRead)).length;
        // Map backend field `read` -> `isRead` for frontend convenience
        const normalized = (response.data as NotificationData[]).map((n) => ({
          ...n,
          isRead: n.isRead ?? n.read ?? false,
        }));
        set({ notifications: normalized as any, unreadCount: unread, isLoading: false });
      } else {
        set({ error: (response as any).message, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      // Optimistic update
      set((state) => {
        const updated = state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });

      await api.markNotificationAsRead(id);
    } catch (error) {
      console.error(error);
      get().fetchNotifications(); // Revert on error
    }
  },

  markAllAsRead: async () => {
    try {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));

      await api.markAllNotificationsAsRead();
    } catch (error) {
      console.error(error);
      get().fetchNotifications();
    }
  },

  deleteNotification: async (id: string) => {
    try {
      set((state) => {
        const updated = state.notifications.filter((n) => n._id !== id);
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });

      await api.deleteNotification(id);
    } catch (error) {
      console.error(error);
    }
  },
}));