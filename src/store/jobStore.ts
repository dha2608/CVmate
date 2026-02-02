import { create } from 'zustand';
import { api } from '@/lib/utils';

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
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
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
  applyJob: (jobId: string) => Promise<void>;
  getJob: (id: string) => Promise<Job | null>;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  isLoading: false,
  error: null,
  pagination: null,

  fetchJobs: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getJobs(params);
      if (response.success) {
        set({ 
          jobs: response.data, 
          pagination: response.pagination,
          isLoading: false 
        });
      } else {
        set({ error: 'Failed to fetch jobs', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch jobs', isLoading: false });
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

  applyJob: async (jobId: string) => {
    try {
      const response = await api.applyJob(jobId);
      if (response.success) {
        // Refresh jobs to update application status
        await get().fetchJobs();
        return true;
      } else {
        throw new Error(response.message || 'Failed to apply');
      }
    } catch (error: any) {
      console.error('Error applying:', error);
      throw error;
    }
  }
}));
