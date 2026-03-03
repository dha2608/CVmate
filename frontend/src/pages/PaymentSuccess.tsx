import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isVi = language === 'vi';
  const copy = {
    invalidSession: isVi ? 'Phiên thanh toán không hợp lệ' : 'Invalid payment session',
    verifyFailed: isVi ? 'Xác minh thanh toán thất bại' : 'Failed to verify payment',
    verifying: isVi ? 'Đang xác minh thanh toán...' : 'Verifying your payment...',
    verificationFailed: isVi ? 'Xác minh thanh toán thất bại' : 'Payment Verification Failed',
    goProfile: isVi ? 'Đi tới hồ sơ' : 'Go to Profile',
    successTitle: isVi ? 'Thanh toán thành công!' : 'Payment Successful!',
    successDesc: isVi
      ? 'Cảm ơn bạn đã nâng cấp CV Mate Premium. Bạn đã có quyền truy cập tất cả tính năng premium.'
      : 'Thank you for subscribing to CV Mate Premium. You now have access to all premium features.',
    goDashboard: isVi ? 'Đi tới Dashboard' : 'Go to Dashboard',
    viewProfile: isVi ? 'Xem hồ sơ' : 'View Profile',
  };

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setError(copy.invalidSession);
        setLoading(false);
        return;
      }

      try {
        const verifyData = await api.verifyCheckoutSession(sessionId);
        if (verifyData.success) {
          const me = await api.getMe();
          if (me.success && me.data) {
            // Ensure token is preserved
            const userData = me.data as any;
            if (userData.token) {
              localStorage.setItem('token', userData.token);
            }
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
          }
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError(err?.message || copy.verifyFailed);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, setUser, copy.invalidSession, copy.verifyFailed]);

  if (loading) {
    return (
      <MainLayout layoutMode="centered" showRightSidebar={false}>
        <div className="py-20 text-center">
          <Loader2 className="mx-auto animate-spin text-crimson-red mb-4" size={48} />
          <p className="text-gray-600">{copy.verifying}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout layoutMode="centered" showRightSidebar={false}>
      <div className="py-20">
        {error ? (
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{copy.verificationFailed}</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/profile')} className="bg-crimson-red hover:bg-fire-red text-white">
              {copy.goProfile}
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center animate-fade-in">
            <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{copy.successTitle}</h2>
            <p className="text-gray-600 mb-6">{copy.successDesc}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard')} className="bg-crimson-red hover:bg-fire-red text-white">
                {copy.goDashboard}
              </Button>
              <Button onClick={() => navigate('/profile')} variant="outline">
                {copy.viewProfile}
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PaymentSuccess;
