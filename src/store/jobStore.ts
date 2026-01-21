import { create } from 'zustand';

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
}

interface JobState {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  applyJob: (jobId: string) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  isLoading: false,
  error: null,

  fetchJobs: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/jobs`);
      const data = await res.json();
      if (data.success) {
        set({ jobs: data.data, isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  applyJob: async (jobId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Applied successfully!');
      } else {
        alert(data.message || 'Failed to apply');
      }
    } catch (error) {
      console.error(error);
      alert('Error applying');
    }
  }
}));
