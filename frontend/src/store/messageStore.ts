import { create } from 'zustand';

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
  fetchConversations: () => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  setActiveConversation: (user: User) => void;
  markAsRead: (userId: string) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const useMessageStore = create<MessageState>((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  isTyping: false,

  fetchConversations: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.error('Authentication failed');
          localStorage.removeItem('token');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      
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
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        set({ isLoading: false });
        return;
      }
      
      const res = await fetch(`${API_URL}/messages/${userId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.error('Authentication failed');
          localStorage.removeItem('token');
          set({ isLoading: false });
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
        const convRes = await fetch(`${API_URL}/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const convData = await convRes.json();
        if (convData.success) {
          set({ conversations: convData.data });
        }
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('sendMessage error:', error);
      throw error;
    }
  },

  markAsRead: async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      
      const res = await fetch(`${API_URL}/messages/${userId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.error('Authentication failed');
          localStorage.removeItem('token');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      
      // Refresh conversations to update unread counts
      const convRes = await fetch(`${API_URL}/messages/conversations`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (convRes.ok) {
        const data = await convRes.json();
        if (data.success) {
          set({ conversations: data.data });
        }
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  setActiveConversation: (user) => set({ activeConversation: user }),
}));
