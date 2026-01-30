import { create } from 'zustand';
import { api } from '@/lib/utils';

export type PersonaType = 'friendly-hr' | 'strict-manager' | 'english-native';

export interface InterviewMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface InterviewFeedback {
  confidenceScore?: number;
  contentScore?: number;
  suggestions?: string;
}

interface InterviewState {
  interviewId: string | null;
  persona: PersonaType | null;
  messages: InterviewMessage[];
  feedback: InterviewFeedback | null;
  status: 'idle' | 'active' | 'completed';
  isStarting: boolean;
  isSending: boolean;
  isEnding: boolean;
  error: string | null;

  startSession: (persona: PersonaType) => Promise<void>;
  sendUserMessage: (message: string) => Promise<void>;
  endSession: () => Promise<void>;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  interviewId: null,
  persona: null,
  messages: [],
  feedback: null,
  status: 'idle',
  isStarting: false,
  isSending: false,
  isEnding: false,
  error: null,

  startSession: async (persona: PersonaType) => {
    set({ isStarting: true, error: null });
    try {
      const response = await api.startInterview(persona);
      if (!response.success) {
        throw new Error('Failed to start interview');
      }

      const interview = response.data;
      set({
        interviewId: interview._id,
        persona: interview.persona,
        messages: interview.chatHistory || [],
        feedback: interview.feedback || null,
        status: interview.status || 'active',
        isStarting: false,
      });
    } catch (error: any) {
      console.error('startSession error', error);
      set({ error: error.message || 'Failed to start interview', isStarting: false });
    }
  },

  sendUserMessage: async (message: string) => {
    const { interviewId, messages, status } = get();
    if (!interviewId || status === 'completed') return;

    // Optimistic update: add user message immediately
    const optimisticMessages: InterviewMessage[] = [
      ...messages,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
    ];

    set({ isSending: true, messages: optimisticMessages, error: null });

    try {
      const response = await api.sendInterviewMessage(interviewId, message);
      if (!response.success) {
        throw new Error('Failed to send message');
      }

      const interview = response.data;
      set({
        messages: interview.chatHistory || optimisticMessages,
        status: interview.status || 'active',
        isSending: false,
      });
    } catch (error: any) {
      console.error('sendUserMessage error', error);
      set({ error: error.message || 'Failed to send message', isSending: false });
    }
  },

  endSession: async () => {
    const { interviewId, status } = get();
    if (!interviewId || status === 'completed') return;

    set({ isEnding: true, error: null });
    try {
      const response = await api.endInterview(interviewId);
      if (!response.success) {
        throw new Error('Failed to end interview');
      }

      const interview = response.data;
      set({
        feedback: interview.feedback || null,
        messages: interview.chatHistory || [],
        status: interview.status || 'completed',
        isEnding: false,
      });
    } catch (error: any) {
      console.error('endSession error', error);
      set({ error: error.message || 'Failed to end interview', isEnding: false });
    }
  },

  reset: () => {
    set({
      interviewId: null,
      persona: null,
      messages: [],
      feedback: null,
      status: 'idle',
      isStarting: false,
      isSending: false,
      isEnding: false,
      error: null,
    });
  },
}));

