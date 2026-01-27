import { create } from 'zustand';

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

const API_URL = 'http://localhost:3001/api';

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        const unread = data.data.filter((n: Notification) => !n.isRead).length;
        set({ notifications: data.data, unreadCount: unread, isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      // Optimistic update
      set(state => {
        const updated = state.notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        );
        return { 
          notifications: updated, 
          unreadCount: updated.filter(n => !n.isRead).length 
        };
      });

      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error(error);
      get().fetchNotifications(); // Revert on error
    }
  },

  markAllAsRead: async () => {
    try {
      const token = localStorage.getItem('token');
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));

      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error(error);
      get().fetchNotifications();
    }
  },

  deleteNotification: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      set(state => {
        const updated = state.notifications.filter(n => n._id !== id);
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.isRead).length
        };
      });

      await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error(error);
    }
  }
}));