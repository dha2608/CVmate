import { create } from 'zustand';

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

const API_URL = 'http://localhost:3001/api';

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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      };

      // Gọi song song 3 API để tiết kiệm thời gian
      // Lưu ý: Nếu backend chưa có endpoint riêng cho thống kê (/dashboard/stats),
      // ta có thể gọi danh sách từng phần và đếm số lượng (.length)
      const [resumesRes, interviewsRes, postsRes] = await Promise.allSettled([
        fetch(`${API_URL}/resumes`, { headers }), // API lấy danh sách CV
        fetch(`${API_URL}/interviews`, { headers }), // API lấy lịch sử phỏng vấn
        fetch(`${API_URL}/posts/me`, { headers }) // API lấy bài viết của user hiện tại
      ]);

      // Helper function để xử lý kết quả trả về từ Promise.allSettled
      const getCountFromResponse = async (result: PromiseSettledResult<Response>) => {
        if (result.status === 'fulfilled' && result.value.ok) {
          const data = await result.value.json();
          // Giả sử API trả về dạng { success: true, data: [...] } hoặc mảng trực tiếp
          if (Array.isArray(data)) return data.length;
          if (data.data && Array.isArray(data.data)) return data.data.length;
          return 0;
        }
        return 0; // Trả về 0 nếu API lỗi hoặc chưa có
      };

      // Tính toán số liệu
      const resumesCount = await getCountFromResponse(resumesRes);
      const interviewsCount = await getCountFromResponse(interviewsRes);
      const postsCount = await getCountFromResponse(postsRes);

      set({
        stats: {
          resumesCount,
          interviewsCount,
          postsCount,
          likesReceived: 0 // Tạm thời để 0 hoặc tính toán thêm nếu API hỗ trợ
        },
        isLoading: false
      });

    } catch (error: any) {
      console.error('Dashboard stats fetch error:', error);
      set({ 
        error: error.message || 'Failed to load dashboard stats', 
        isLoading: false 
      });
    }
  }
}));