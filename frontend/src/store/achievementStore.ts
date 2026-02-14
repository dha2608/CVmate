import { create } from 'zustand';
import { api } from '@/lib/utils';
import type { Achievement } from '@/types/api';

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
      if (res.success && res.data) {
        set({ achievements: res.data, isLoading: false });
      } else {
        set({ error: (res as any).message || 'Failed to load achievements', isLoading: false });
      }
    } catch (error: any) {
      // Silently fail - achievements are optional
      set({ error: null, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await api.getAchievementStats();
      if (res.success) {
        set({ stats: res.data as any });
      }
    } catch (error: any) {
      // Silently fail - achievements are optional
      // Don't log errors for optional features
    }
  },
}));
