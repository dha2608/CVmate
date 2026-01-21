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
  fetchConversations: () => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  setActiveConversation: (user: User) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,

  fetchConversations: async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ conversations: data.data });
      }
    } catch (error) {
      console.error(error);
    }
  },

  fetchMessages: async (userId: string) => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ messages: data.data, isLoading: false });
      }
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ receiverId, content })
      });
      const data = await res.json();
      if (data.success) {
        set((state) => ({ messages: [...state.messages, data.data] }));
      }
    } catch (error) {
      console.error(error);
    }
  },

  setActiveConversation: (user) => set({ activeConversation: user })
}));
