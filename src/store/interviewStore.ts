import { create } from 'zustand';
import { api } from '@/lib/utils';

export type PersonaType = 'friendly-hr' | 'strict-manager' | 'english-native' | 'tech-lead' | 'startup-founder' | 'executive' | 'academic';

export interface InterviewMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface InterviewPerQuestionFeedback {
  question: string;
  answer: string;
  score: number;
  feedback: string;
}

export interface InterviewFeedback {
  confidenceScore?: number;
  contentScore?: number;
  suggestions?: string;
  strengths?: string[];
  improvements?: string[];
  overallScore?: number;
  scoresByDimension?: {
    communication?: number;
    content?: number;
    confidence?: number;
    structure?: number;
  };
  perQuestionFeedback?: InterviewPerQuestionFeedback[];
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
      
      // Handle specific error cases
      let errorMessage = 'Failed to send message';
      const status = error.status || 0;
      const errorText = error.message || '';
      const errorLower = errorText.toLowerCase();
      const errorType = (error as any).type || '';
      
      if (status === 402 || errorLower.includes('payment') || errorLower.includes('insufficient credits')) {
        errorMessage = 'AI provider account has insufficient credits or requires payment. Please check your Hugging Face billing or quota.';
      } else if (status === 429 || errorLower.includes('rate limit') || errorLower.includes('rate_limit')) {
        // Check if it's from server rate limiter or OpenAI API
        if (errorType === 'server_rate_limit' || errorLower.includes('daily limit') || errorLower.includes('ai service rate limit')) {
          errorMessage = 'You have reached the server rate limit for AI features. In development mode, the limit is 100 requests/hour. Please wait a moment and try again, or upgrade to premium for higher limits.';
        } else if (errorLower.includes('quota') || errorLower.includes('exceeded your current quota') || errorLower.includes('billing')) {
          errorMessage = 'AI API quota exceeded. Your account has run out of credits or reached its usage limit.\n\nPlease check your provider dashboard and adjust your plan or usage, then wait a few minutes and try again.';
        } else {
          errorMessage = 'AI API rate limit exceeded. This usually means:\n• Too many requests in a short time\n• Your account has reached its API quota\n• Insufficient credits in your AI provider account\n\nPlease wait 1-2 minutes before trying again, or check your provider billing.';
        }
      } else if (errorLower.includes('quota') || errorLower.includes('exceeded your current quota')) {
        errorMessage = 'AI API quota exceeded. Your account has run out of credits or reached its usage limit.\n\nPlease check your provider dashboard and adjust your plan or usage, then wait a few minutes and try again.';
      } else if (status === 401 || errorLower.includes('unauthorized') || errorLower.includes('api key') || errorLower.includes('invalid')) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your backend .env file and restart the server.';
      } else if (status === 503 || errorLower.includes('503') || errorLower.includes('service temporarily unavailable') || errorLower.includes('service unavailable')) {
        errorMessage = errorText || 'Service temporarily unavailable. Please try again in a few moments.';
      } else if (errorLower.includes('not configured') || errorLower.includes('not configured')) {
        errorMessage = 'AI API key is not configured. Please set HF_API_KEY in your backend .env file and restart the server.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Revert optimistic update on error
      set({ 
        error: errorMessage, 
        isSending: false,
        messages: messages, // Revert to previous messages
      });
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

