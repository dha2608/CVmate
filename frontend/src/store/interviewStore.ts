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
  endSession: (retryCount?: number) => Promise<void>;
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
      if (!interview) {
        throw new Error('Interview not found');
      }
      set({
        interviewId: interview._id,
        persona: interview.persona,
        messages: interview.messages || [],
        feedback: interview.feedback ? {
          confidenceScore: interview.feedback.confidence,
          contentScore: interview.feedback.accuracy,
          suggestions: (() => {
            const suggestions = interview.feedback.suggestions;
            if (!suggestions) return undefined;
            if (Array.isArray(suggestions)) {
              return suggestions.filter(s => s != null).join('\n');
            }
            if (typeof suggestions === 'string') {
              return suggestions;
            }
            try {
              return String(suggestions);
            } catch {
              return undefined;
            }
          })(),
        } : null,
        status: interview.endedAt ? 'completed' : 'active',
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

      const interview = response.data?.interview;
      if (interview) {
        set({
          messages: interview.messages || optimisticMessages,
          status: interview.endedAt ? 'completed' : 'active',
          isSending: false,
        });
      } else {
        set({
          isSending: false,
        });
      }
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

  endSession: async (retryCount = 0) => {
    const { interviewId, status, endSession: endSessionFn } = get();
    if (!interviewId || status === 'completed') return;

    set({ isEnding: true, error: null });
    try {
      const response = await api.endInterview(interviewId) as { success: boolean; data: any; warning?: string; message?: string };
      if (!response.success) {
        throw new Error((response as any).message || 'Failed to end interview');
      }

      const interview = response.data;
      set({
        feedback: interview.feedback || null,
        messages: interview.chatHistory || [],
        status: interview.status || 'completed',
        isEnding: false,
      });
      
      // Show warning if fallback feedback was used
      if (response.warning) {
        const { useToastStore } = await import('@/store/toastStore');
        useToastStore.getState().warning(response.warning);
      }
    } catch (error: any) {
      console.error('endSession error', error);
      
      // Retry mechanism for retryable errors (max 2 retries)
      const isRetryable = error?.details?.retryable || error?.status === 503 || error?.status === 429;
      if (isRetryable && retryCount < 2) {
        const { useToastStore } = await import('@/store/toastStore');
        useToastStore.getState().warning(`Service temporarily unavailable. Retrying... (${retryCount + 1}/2)`);
        set({ isEnding: false });
        // Wait 2 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return get().endSession(retryCount + 1);
      }
      
      let errorMessage = error.message || 'Failed to end interview';
      
      // Provide helpful error messages
      if (error?.status === 503 || error?.message?.toLowerCase().includes('unavailable')) {
        errorMessage = 'AI feedback service is temporarily unavailable. Please try again in a few moments.';
      } else if (error?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error?.status === 402) {
        errorMessage = 'AI service quota exceeded. Please check your account limits.';
      }
      
      set({ error: errorMessage, isEnding: false });
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

