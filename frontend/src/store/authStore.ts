import { create } from 'zustand';
import { authApi } from '@/lib/apiClient';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  avatar?: string;
  bio?: string;
  headline?: string;
  location?: string;
  yearsOfExperience?: number;
  currentRole?: string;
  industries?: string[];
  skills?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  isPublicProfile?: boolean;
  onboardingCompleted?: boolean;
  careerGoal?: 'new-job' | 'internship' | 'career-switch';
  twoFactorEnabled?: boolean;
  subscription?: {
    plan: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: Date;
    endDate?: Date;
    paymentMethod?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    billingCycle?: 'monthly' | 'yearly';
  };
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialUserJson = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const initialUser = initialUserJson ? (JSON.parse(initialUserJson) as User) : null;

  return {
    user: initialUser,
    setUser: (user) => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        if (user.token) {
          localStorage.setItem('token', user.token);
        }
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      set({ user });
    },
    logout: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null });
    },
    deleteAccount: async () => {
      await authApi.deleteAccount();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null });
    },
  };
});
