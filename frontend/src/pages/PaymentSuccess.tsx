import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setError('Invalid payment session');
        setLoading(false);
        return;
      }

      try {
        // Verify payment và update user subscription
        const userData = localStorage.getItem('user');
        const token = userData ? JSON.parse(userData).token : null;

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/payment/subscription-status`, {
          credentials: 'include', // Include cookies for cross-origin requests
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.success) {
          // Update user trong store
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (currentUser.data) {
            currentUser.data.subscription = data.data;
            localStorage.setItem('user', JSON.stringify(currentUser));
            setUser(currentUser.data);
          }
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, setUser]);

  if (loading) {
    return (
      <MainLayout layoutMode="centered" showLeftSidebar={false} showRightSidebar={false}>
        <div className="py-20 text-center">
          <Loader2 className="mx-auto animate-spin text-crimson-red mb-4" size={48} />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout layoutMode="centered" showLeftSidebar={false} showRightSidebar={false}>
      <div className="py-20">
        {error ? (
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/profile')} className="bg-crimson-red hover:bg-fire-red text-white">
              Go to Profile
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center animate-fade-in">
            <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for subscribing to CV Mate Premium. You now have access to all premium features.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard')} className="bg-crimson-red hover:bg-fire-red text-white">
                Go to Dashboard
              </Button>
              <Button onClick={() => navigate('/profile')} variant="outline">
                View Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PaymentSuccess;
