import { create } from 'zustand';

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
  subscription?: {
    plan: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: Date;
    endDate?: Date;
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
}));
