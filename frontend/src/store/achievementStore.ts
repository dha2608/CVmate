import { create } from 'zustand';
import { api } from '@/lib/utils';

export interface Achievement {
  _id: string;
  user: string;
  type: 'first_cv' | 'complete_profile' | 'apply_job' | 'write_post' | 'complete_interview';
  unlockedAt: string;
  metadata?: {
    resumeId?: string;
    jobId?: string;
    postId?: string;
    interviewId?: string;
  };
}

interface AchievementState {
  achievements: Achievement[];
  stats: {
    total: number;
    types: {
      first_cv: boolean;
      complete_profile: boolean;
      apply_job: boolean;
      write_post: boolean;
      complete_interview: boolean;
    };
  } | null;
  isLoading: boolean;
  error: string | null;
  fetchAchievements: () => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  achievements: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchAchievements: async () => {
    set({ isLoading: true });
    try {
      const res = await api.getAchievements();
      if (res.success) {
        set({ achievements: res.data as Achievement[], isLoading: false });
      } else {
        set({ error: (res as any).message || 'Failed to load achievements', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await api.getAchievementStats();
      if (res.success) {
        set({ stats: res.data as any });
      }
    } catch (error: any) {
      console.error('Failed to fetch achievement stats:', error);
    }
  },
}));
