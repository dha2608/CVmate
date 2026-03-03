import { create } from 'zustand';
import { api } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  requirements: string[];
  logo?: string;
  postedAt: string;
  postedBy?: any;
  applicants?: string[];
}

interface JobState {
  jobs: Job[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  lastFetchParams: {
    search?: string;
    type?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    experienceLevel?: string;
    companySize?: string;
  };
  fetchJobs: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    experienceLevel?: string;
    companySize?: string;
  }) => Promise<void>;
  loadMore: () => Promise<void>;
  applyJob: (jobId: string) => Promise<void>;
  getJob: (id: string) => Promise<Job | null>;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  error: null,
  pagination: null,
  lastFetchParams: {},

  fetchJobs: async (params = {}) => {
    const { page, limit, ...filterParams } = params;
    set({ isLoading: true, error: null, lastFetchParams: filterParams });
    try {
      const response = await api.getJobs({ ...params, page: page || 1, limit: limit || 20 });
      if (response.success) {
        const hasMore = response.pagination
          ? response.pagination.page < response.pagination.pages
          : false;
        set({
          jobs: response.data,
          pagination: response.pagination,
          hasMore,
          isLoading: false,
        });
      } else {
        set({ error: 'Failed to fetch jobs', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch jobs', isLoading: false });
    }
  },

  loadMore: async () => {
    const { isLoadingMore, hasMore, pagination, lastFetchParams } = get();
    if (isLoadingMore || !hasMore || !pagination) return;

    const nextPage = pagination.page + 1;
    set({ isLoadingMore: true });
    try {
      const response = await api.getJobs({
        ...lastFetchParams,
        page: nextPage,
        limit: pagination.limit,
      });
      if (response.success) {
        const hasMore = response.pagination
          ? response.pagination.page < response.pagination.pages
          : false;
        set((state) => ({
          jobs: [...state.jobs, ...response.data],
          pagination: response.pagination,
          hasMore,
          isLoadingMore: false,
        }));
      } else {
        set({ isLoadingMore: false });
      }
    } catch {
      set({ isLoadingMore: false });
    }
  },

  getJob: async (id: string) => {
    try {
      const response = await api.getJob(id);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error: any) {
      console.error('Failed to fetch job:', error);
      return null;
    }
  },

  applyJob: async (jobId: string): Promise<void> => {
    try {
      const response = await api.applyJob(jobId);
      if (response.success) {
        // Refresh jobs to update application status
        await get().fetchJobs();
        trackEvent('job_applied', { jobId });
      } else {
        throw new Error(response.message || 'Failed to apply');
      }
    } catch (error: any) {
      console.error('Error applying:', error);
      throw error;
    }
  },
}));
