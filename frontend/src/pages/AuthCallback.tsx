import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { logger } from '@/lib/logger';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const needsOnboarding = searchParams.get('onboarding') === 'true';

    // Handle error from OAuth callback
    if (error) {
      logger.error('oauth_callback_error', new Error(String(error)));
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      const fetchUser = async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
          const normalizedApiUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

          const response = await fetch(`${normalizedApiUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          });

          const data = await response.json();

          if (data.success) {
            logger.info('oauth_callback_success', { needsOnboarding, hasUser: !!data.data });
            const userData = { ...data.data, token };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            if (needsOnboarding || !data.data.onboardingCompleted) {
              navigate('/onboarding');
            } else {
              navigate('/dashboard');
            }
          } else {
            logger.warn('oauth_callback_fetch_me_failed', { status: response.status });
            navigate('/login');
          }
        } catch (error) {
          logger.error('oauth_callback_fetch_me_error', error);
          navigate('/login');
        }
      };

      fetchUser();
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-crimson-red border-t-transparent mb-4"></div>
        <p className="text-gray-600">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
