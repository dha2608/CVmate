import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useI18n } from '@/store/i18nStore';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const { language } = useI18n();

  const isVi = language === 'vi';
  const copy = {
    title: isVi ? 'Thanh toán đã bị hủy' : 'Payment Cancelled',
    description: isVi
      ? 'Thanh toán của bạn đã bị hủy. Không có khoản phí nào được tính. Bạn có thể thử lại bất cứ lúc nào.'
      : 'Your payment was cancelled. No charges were made. You can try again anytime.',
    goProfile: isVi ? 'Đi tới hồ sơ' : 'Go to Profile',
    backHome: isVi ? 'Quay về trang chủ' : 'Back to Home',
  };

  return (
    <MainLayout layoutMode="centered" showLeftSidebar={false} showRightSidebar={false}>
      <div className="py-20">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center animate-fade-in">
          <XCircle className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{copy.title}</h2>
          <p className="text-gray-600 mb-6">{copy.description}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/profile')} className="bg-crimson-red hover:bg-fire-red text-white">
              {copy.goProfile}
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              {copy.backHome}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentCancel;
