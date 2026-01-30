import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-20">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center animate-fade-in">
          <XCircle className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. No charges were made. You can try again anytime.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/profile')} className="bg-crimson-red hover:bg-fire-red text-white">
              Go to Profile
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentCancel;
