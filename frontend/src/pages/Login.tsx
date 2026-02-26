import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/utils';
import { logger } from '@/lib/logger';

const Login = () => {
  const { t } = useI18n();
  const toast = useToastStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (!oauthError) {
      return;
    }

    const errorMessageMap: Record<string, string> = {
      google_auth_failed: 'Google đăng nhập thất bại. Vui lòng thử lại.',
      google_auth_error: 'Đăng nhập Google gặp lỗi. Vui lòng thử lại.',
      access_denied: 'Bạn đã từ chối quyền đăng nhập Google.',
    };

    const message = errorMessageMap[oauthError] || t('toast.loginFailed');
    setError(message);
    toast.error(message);
  }, [searchParams, t, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);

      if (data.success) {
        logger.info('login_success', { email });
        setUser(data.data);
        toast.success(t('toast.loginSuccess'));

        const shouldGoOnboarding = !data.data?.onboardingCompleted;
        navigate(shouldGoOnboarding ? '/onboarding' : '/dashboard');
      } else {
        const errorMsg = (data as any).message || t('login.invalidCredentials');
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      logger.error('login_failed', err);
      let errorMsg = err.message || t('toast.loginFailed');

      if (err.type === 'timeout' || err.status === 408) {
        errorMsg = t('toast.requestTimeout') || 'Request timeout. Please check your connection and try again.';
      } else if (err.status === 503) {
        errorMsg = 'Service temporarily unavailable. Please try again in a few moments.';
      } else if (err.status === 429) {
        errorMsg = 'Too many requests. Please wait a moment and try again.';
      }

      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl mx-auto grid gap-10 md:gap-14 md:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)] items-center">
        <div className="hidden md:block space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-crimson-red rounded-2xl text-white font-black text-2xl shadow-lg">
            CV
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-jet-black dark:text-white">
            {t('login.welcomeBack')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
            {t('login.signInToContinue')}
          </p>
          <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson-red" />
              {t('home.atsOptimized')}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson-red" />
              {t('home.aiInterviewPracticeDesc')}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson-red" />
              {t('home.careerCommunityDesc')}
            </li>
          </ul>
        </div>

        <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900/90 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl shadow-black/5 p-8 space-y-8">
          <div className="md:hidden text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-crimson-red rounded-2xl text-white font-black text-2xl shadow-md">
              CV
            </div>
            <h1 className="text-3xl font-black text-jet-black dark:text-white">{t('login.welcomeBack')}</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('login.signInToContinue')}</p>
          </div>

          {error && (
            <div className="p-3 text-sm text-crimson-red bg-red-50/80 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-jet-black dark:text-gray-100">{t('auth.email')}</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
                className="h-11 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-crimson-red focus:ring-crimson-red"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-jet-black dark:text-gray-100">{t('auth.password')}</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-11 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-crimson-red focus:ring-crimson-red"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-crimson-red hover:bg-fire-red text-white font-semibold text-base rounded-lg"
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                {t('login.orContinueWith')}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all text-sm"
            onClick={() => {
              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
              const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
              window.location.href = `${baseUrl}/api/auth/google`;
            }}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('login.signInWithGoogle')}
          </Button>

          <div className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {t('login.dontHaveAccount')}{' '}
            <Link to="/register" className="font-semibold text-crimson-red hover:underline">
              {t('login.createOne')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
