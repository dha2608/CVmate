import { create } from 'zustand';
import { realtimeClient } from '../services/realtimeClient';

interface User {
  _id: string;
  name: string;
  avatar?: string;
}

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
}

interface MessageState {
  conversations: User[];
  activeConversation: User | null;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  typingUser: string | null;
  isConnected: boolean;
  fetchConversations: () => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  setActiveConversation: (user: User) => void;
  markAsRead: (userId: string) => Promise<void>;
  connectRealtime: () => void;
  disconnectRealtime: () => void;
  sendTyping: (recipientId: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/** Helper to get auth token from localStorage */
function getToken(): string | null {
  let token = localStorage.getItem('token');
  if (!token) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user?.token || null;
      } catch {
        // Ignore parse error
      }
    }
  }
  return token;
}

/** Helper to make authenticated fetch */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 || res.status === 403) {
    console.error('Authentication failed');
    localStorage.removeItem('token');
    throw new Error('Authentication failed');
  }

  return res;
}

/** Debounced typing sender */
let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  isTyping: false,
  typingUser: null,
  isConnected: false,

  connectRealtime: () => {
    const token = getToken();
    if (!token) return;

    realtimeClient.connect({
      apiUrl: API_URL,
      token,
      onConnectionChange: (connected) => {
        set({ isConnected: connected });
      },
    });

    // Listen for new messages
    realtimeClient.on('new_message', (data) => {
      const msg = data as Message;
      const state = get();

      // Add message if we're in the conversation with the sender
      if (state.activeConversation?._id === msg.sender) {
        // Avoid duplicates
        const exists = state.messages.some((m) => m._id === msg._id);
        if (!exists) {
          set({ messages: [...state.messages, msg] });
        }
        // Clear typing indicator
        set({ isTyping: false, typingUser: null });
      }

      // Refresh conversations to update sidebar (last message, unread count)
      get().fetchConversations();
    });

    // Listen for sent message confirmation (multi-tab sync)
    realtimeClient.on('message_sent', (data) => {
      const msg = data as Message;
      const state = get();

      if (state.activeConversation?._id === msg.receiver) {
        const exists = state.messages.some((m) => m._id === msg._id);
        if (!exists) {
          set({ messages: [...state.messages, msg] });
        }
      }
    });

    // Listen for typing events
    realtimeClient.on('typing', (data) => {
      const { senderId, senderName } = data as { senderId: string; senderName: string };
      const state = get();
      if (state.activeConversation?._id === senderId) {
        set({ isTyping: true, typingUser: senderName });
      }
    });

    realtimeClient.on('typing_stop', (data) => {
      const { senderId } = data as { senderId: string };
      const state = get();
      if (state.activeConversation?._id === senderId) {
        set({ isTyping: false, typingUser: null });
      }
    });

    // Listen for read receipts
    realtimeClient.on('messages_read', () => {
      // Refresh conversations to update read state
      get().fetchConversations();
    });
  },

  disconnectRealtime: () => {
    realtimeClient.disconnect();
    set({ isConnected: false });
  },

  sendTyping: (recipientId: string) => {
    // Debounce: only send once every 2 seconds
    if (typingTimeout) return;
    realtimeClient.sendTyping(recipientId);
    typingTimeout = setTimeout(() => {
      typingTimeout = null;
    }, 2000);
  },

  fetchConversations: async () => {
    try {
      const res = await authFetch(`${API_URL}/messages/conversations`);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.success) {
        set({ conversations: data.data });
      }
    } catch (error) {
      console.error('fetchConversations error:', error);
    }
  },

  fetchMessages: async (userId: string) => {
    set({ isLoading: true });
    try {
      const res = await authFetch(`${API_URL}/messages/${userId}`);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.success) {
        set({ messages: data.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('fetchMessages error:', error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    try {
      const res = await authFetch(`${API_URL}/messages`, {
        method: 'POST',
        body: JSON.stringify({ receiverId, content }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(errorData.message || `Failed to send message: ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.data) {
        set((state) => ({ messages: [...state.messages, data.data] }));
        // Refresh conversations to update lastMessage
        get().fetchConversations();
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('sendMessage error:', error);
      throw error;
    }
  },

  markAsRead: async (userId: string) => {
    try {
      const res = await authFetch(`${API_URL}/messages/${userId}/read`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Refresh conversations to update unread counts
      get().fetchConversations();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  setActiveConversation: (user) =>
    set({ activeConversation: user, isTyping: false, typingUser: null }),
}));
