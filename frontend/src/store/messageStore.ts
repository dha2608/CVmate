import { create } from 'zustand';
import { api } from '@/lib/utils';

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

export const useMessageStore = create<MessageState>((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  isTyping: false,

  fetchConversations: async () => {
    try {
      const response = await api.getConversations();
      if (response.success) {
        set({ conversations: response.data });
      }
    } catch (error) {
      console.error(error);
    }
  },

  fetchMessages: async (userId: string) => {
    set({ isLoading: true });
    try {
      const response = await api.getMessages(userId);
      if (response.success) {
        set({ messages: response.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    try {
      const response = await api.sendMessage(receiverId, content);
      if (response.success) {
        set((state) => ({ messages: [...state.messages, response.data] }));
      } else {
        throw new Error((response as any).message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  },

  markAsRead: async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/messages/${userId}/read`, {
        method: 'POST',
        credentials: 'include', // Include cookies for cross-origin requests
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh conversations to update unread counts
      const res = await fetch(`${API_URL}/messages/conversations`, {
        credentials: 'include', // Include cookies for cross-origin requests
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        set({ conversations: data.data });
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  setActiveConversation: (user) => set({ activeConversation: user }),
}));
