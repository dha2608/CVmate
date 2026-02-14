import { create } from 'zustand';
import { setUserContext, clearUserContext } from '@/lib/errorTracking';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  avatar?: string;
  coverPhoto?: string;
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
  subscription?: {
    plan: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: string | Date;
    endDate?: string | Date;
    paymentMethod?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      if (user.token) {
        localStorage.setItem('token', user.token);
      }
      // Set user context for error tracking
      setUserContext(user._id, user.email, user.name);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Clear user context on logout
      clearUserContext();
    }
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Clear user context on logout
    clearUserContext();
    set({ user: null });
  },
}));
