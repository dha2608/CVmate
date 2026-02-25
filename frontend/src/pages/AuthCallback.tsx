import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

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
      console.error('OAuth error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      const fetchUser = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (data.success) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/1386123c-2287-451b-80f4-d6f4e7719507', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: `log_${Date.now()}_AuthCallbackSuccess`,
                timestamp: Date.now(),
                location: 'frontend/src/pages/AuthCallback.tsx:fetchUser',
                runId: 'pre-fix',
                hypothesisId: 'H4',
                message: 'AuthCallback success before setUser',
                data: {},
              }),
            }).catch(() => {});
            // #endregion agent log

            const userData = { ...data.data, token };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            if (needsOnboarding || !data.data.onboardingCompleted) {
              navigate('/onboarding');
            } else {
              navigate('/dashboard');
            }
          } else {
            navigate('/login');
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
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
