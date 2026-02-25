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

export const useAuthStore = create<AuthState>((set) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/1386123c-2287-451b-80f4-d6f4e7719507', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `log_${Date.now()}_auth_init`,
      timestamp: Date.now(),
      location: 'frontend/src/store/authStore.ts:authStoreInit',
      runId: 'pre-fix',
      hypothesisId: 'H1',
      message: 'Auth store initialized',
      data: {},
    }),
  }).catch(() => {});
  // #endregion agent log

  const initialUserJson = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const initialUser = initialUserJson ? (JSON.parse(initialUserJson) as User) : null;

  return {
    user: initialUser,
    setUser: (user) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1386123c-2287-451b-80f4-d6f4e7719507', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `log_${Date.now()}_setUser`,
          timestamp: Date.now(),
          location: 'frontend/src/store/authStore.ts:setUser',
          runId: 'pre-fix',
          hypothesisId: 'H1',
          message: 'setUser called',
          data: { hasUser: !!user },
        }),
      }).catch(() => {});
      // #endregion agent log

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
  };
});
