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

  // Real-time methods (SSE with polling fallback)
  connectSSE: () => void;
  disconnectSSE: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Connection state (outside store to avoid re-renders)
let eventSource: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let pollingTimer: ReturnType<typeof setInterval> | null = null;
let reconnectDelay = 1000;
let sseFailCount = 0;
let usingPolling = false;

const MAX_RECONNECT_DELAY = 30000;
const MAX_SSE_FAILURES = 3; // After 3 failures, switch to polling
const POLL_INTERVAL = 30000; // 30 seconds

type StoreApi = {
  getState: () => NotificationState;
  setState: (partial: Partial<NotificationState>) => void;
};

function startPolling(storeApi: StoreApi) {
  if (pollingTimer) return; // Already polling
  usingPolling = true;

  // Fetch immediately
  storeApi.getState().fetchNotifications();

  // Then poll every 30s
  pollingTimer = setInterval(() => {
    storeApi.getState().fetchNotifications();
  }, POLL_INTERVAL);

  storeApi.setState({ isConnected: true }); // "connected" via polling
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
  usingPolling = false;
}

function createSSEConnection(storeApi: StoreApi) {
  const token = localStorage.getItem('token');
  if (!token) return;

  // If already exceeded SSE failure threshold, go straight to polling
  if (sseFailCount >= MAX_SSE_FAILURES) {
    if (!usingPolling) {
      console.info('[notifications] SSE unavailable, using polling fallback');
      startPolling(storeApi);
    }
    return;
  }

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
      reconnectDelay = 1000;
      sseFailCount = 0; // Reset on successful connection
      stopPolling(); // Stop polling if it was running
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

  // Auth failure from server — stop reconnecting entirely
  eventSource.addEventListener('error', (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      if (data.message === 'unauthorized') {
        eventSource?.close();
        eventSource = null;
        storeApi.setState({ isConnected: false });
        return;
      }
    } catch {
      // Not a JSON error event, ignore
    }
  });

  eventSource.onerror = () => {
    storeApi.setState({ isConnected: false });
    eventSource?.close();
    eventSource = null;
    sseFailCount++;

    if (sseFailCount >= MAX_SSE_FAILURES) {
      // Switch to polling fallback
      console.info('[notifications] SSE failed %d times, switching to polling', sseFailCount);
      startPolling(storeApi);
    } else {
      scheduleReconnect(storeApi);
    }
  };
}

function scheduleReconnect(storeApi: StoreApi) {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createSSEConnection(storeApi);
    reconnectDelay = Math.min(reconnectDelay * 2 + Math.random() * 500, MAX_RECONNECT_DELAY);
  }, reconnectDelay);
}

function cleanupAll() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  stopPolling();
  reconnectDelay = 1000;
  sseFailCount = 0;
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
    cleanupAll();
    set({ isConnected: false });
  },
}));
