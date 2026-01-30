import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const needsOnboarding = searchParams.get('onboarding') === 'true';

    if (token) {
      // Lưu token và fetch user info
      const fetchUser = async () => {
        try {
          const response = await fetch('http://localhost:5001/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (data.success) {
            // Lưu user vào localStorage và store
            const userData = { ...data.data, token };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            // Redirect dựa trên onboarding status
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
