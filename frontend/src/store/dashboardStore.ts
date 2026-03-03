import { create } from 'zustand';
import { api } from '@/lib/utils';

export interface RecentResume {
  _id: string;
  title: string;
  atsScore?: number;
  themeConfig?: { template?: string };
  updatedAt: string;
}

export interface RecentInterview {
  _id: string;
  persona: string;
  feedback?: { score?: number };
  createdAt: string;
  isCompleted?: boolean;
}

export interface DashboardStats {
  resumesCount: number;
  interviewsCount: number;
  postsCount: number;
  articlesCount: number;
  applicationsCount: number;
  avgAtsScore: number;
  avgInterviewScore: number;
  recentResumes: RecentResume[];
  recentInterviews: RecentInterview[];
}

const defaultStats: DashboardStats = {
  resumesCount: 0,
  interviewsCount: 0,
  postsCount: 0,
  articlesCount: 0,
  applicationsCount: 0,
  avgAtsScore: 0,
  avgInterviewScore: 0,
  recentResumes: [],
  recentInterviews: [],
};

interface DashboardState {
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  resetStats: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: { ...defaultStats },
  isLoading: false,
  error: null,

  resetStats: () => set({ stats: { ...defaultStats }, error: null }),

  fetchStats: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getDashboardStats();
      if (!response.success) {
        throw new Error('Failed to load dashboard stats');
      }

      const data = response.data || {};
      const overview = data.overview || {};
      const performance = data.performance || {};
      const recent = data.recent || {};

      set({
        stats: {
          resumesCount: overview.resumes || 0,
          interviewsCount: overview.interviews || 0,
          postsCount: overview.posts || 0,
          articlesCount: overview.articles || 0,
          applicationsCount: overview.applications || 0,
          avgAtsScore: performance.avgAtsScore || 0,
          avgInterviewScore: performance.avgInterviewScore || 0,
          recentResumes: recent.resumes || [],
          recentInterviews: recent.interviews || [],
        },
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Dashboard stats fetch error:', error);
      set({
        stats: { ...defaultStats },
        error: error.message || 'Failed to load dashboard stats',
        isLoading: false,
      });
    }
  },
}));
