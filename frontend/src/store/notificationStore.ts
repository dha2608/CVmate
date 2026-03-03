import { create } from 'zustand';

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  type: 'like' | 'comment' | 'job' | 'system' | 'connection' | 'security' | 'follow';
  message: string;
  link?: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;

  // REST methods
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // SSE real-time methods
  connectSSE: () => void;
  disconnectSSE: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// SSE connection state (outside store to avoid re-renders)
let eventSource: EventSource | null = null;
let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 1000;
const MAX_RECONNECT_DELAY = 30000;

function createSSEConnection(storeApi: {
  getState: () => NotificationState;
  setState: (partial: Partial<NotificationState>) => void;
}) {
  const token = localStorage.getItem('token');
  if (!token) return;

  // Close existing connection
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }

  const url = `${API_URL}/notifications/events?token=${encodeURIComponent(token)}`;
  eventSource = new EventSource(url);

  eventSource.addEventListener('connected', (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      storeApi.setState({
        isConnected: true,
        unreadCount: data.unread ?? storeApi.getState().unreadCount,
      });
      reconnectDelay = 1000; // Reset backoff
    } catch {
      storeApi.setState({ isConnected: true });
    }
  });

  eventSource.addEventListener('new_notification', (e: MessageEvent) => {
    try {
      const raw = JSON.parse(e.data);
      const notification: Notification = {
        ...raw,
        isRead: raw.isRead ?? raw.read ?? false,
      };
      const current = storeApi.getState();
      storeApi.setState({
        notifications: [notification, ...current.notifications],
        unreadCount: current.unreadCount + 1,
      });
    } catch {
      // Ignore parse errors
    }
  });

  // Auth failure from server — stop reconnecting
  eventSource.addEventListener('error', (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      if (data.message === 'unauthorized') {
        eventSource?.close();
        eventSource = null;
        storeApi.setState({ isConnected: false });
        return; // Don't schedule reconnect for auth failures
      }
    } catch {
      // Not a JSON error event, ignore
    }
  });

  eventSource.onerror = () => {
    storeApi.setState({ isConnected: false });
    eventSource?.close();
    eventSource = null;
    scheduleReconnect(storeApi);
  };
}

function scheduleReconnect(storeApi: {
  getState: () => NotificationState;
  setState: (partial: Partial<NotificationState>) => void;
}) {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createSSEConnection(storeApi);
    reconnectDelay = Math.min(reconnectDelay * 2 + Math.random() * 500, MAX_RECONNECT_DELAY);
  }, reconnectDelay);
}

function cleanupSSE() {
  if (heartbeatTimer) {
    clearTimeout(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  reconnectDelay = 1000;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isConnected: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        interface NotificationData {
          read?: boolean;
          isRead?: boolean;
          [key: string]: unknown;
        }
        const unread = (data.data as NotificationData[]).filter(
          (n) => !(n.read ?? n.isRead)
        ).length;
        const normalized = (data.data as NotificationData[]).map((n) => ({
          ...n,
          isRead: n.isRead ?? n.read ?? false,
        }));
        set({ notifications: normalized as Notification[], unreadCount: unread, isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      set((state) => {
        const updated = state.notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n));
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });

      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error(error);
      get().fetchNotifications();
    }
  },

  markAllAsRead: async () => {
    try {
      const token = localStorage.getItem('token');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));

      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error(error);
      get().fetchNotifications();
    }
  },

  deleteNotification: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      set((state) => {
        const updated = state.notifications.filter((n) => n._id !== id);
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });

      await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error(error);
    }
  },

  connectSSE: () => {
    const storeApi = { getState: get, setState: set };
    createSSEConnection(storeApi);
  },

  disconnectSSE: () => {
    cleanupSSE();
    set({ isConnected: false });
  },
}));
