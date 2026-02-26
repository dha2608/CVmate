import { create } from 'zustand';
import { api } from '@/lib/utils';

// Định nghĩa kiểu dữ liệu cho các chỉ số thống kê
export interface DashboardStats {
  resumesCount: number;
  interviewsCount: number;
  postsCount: number;
  likesReceived: number; // Tùy chọn: tổng số like nhận được
}

interface DashboardState {
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchStats: () => Promise<void>;
  resetStats: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // State khởi tạo
  stats: {
    resumesCount: 0,
    interviewsCount: 0,
    postsCount: 0,
    likesReceived: 0,
  },
  isLoading: false,
  error: null,

  // Reset khi logout
  resetStats: () => set({ 
    stats: { resumesCount: 0, interviewsCount: 0, postsCount: 0, likesReceived: 0 },
    error: null 
  }),

  // Hàm lấy dữ liệu thống kê
  fetchStats: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.getDashboardStats();
      if (!response.success) {
        throw new Error('Failed to load dashboard stats');
      }

      const data = response.data || {};
      const overview = data.overview || {};

      set({
        stats: {
          resumesCount: overview.resumes || 0,
          interviewsCount: overview.interviews || 0,
          postsCount: overview.posts || 0,
          likesReceived: 0, // Có thể mở rộng sau nếu backend hỗ trợ
        },
        isLoading: false,
      });

    } catch (error: any) {
      console.error('Dashboard stats fetch error:', error);
      set({
        // fallback an toàn để dashboard vẫn hoạt động
        stats: { resumesCount: 0, interviewsCount: 0, postsCount: 0, likesReceived: 0 },
        error: error.message || 'Failed to load dashboard stats',
        isLoading: false,
      });
    }
  }
}));