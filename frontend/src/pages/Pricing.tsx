import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '@/store/i18nStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Check, X, Brain, Zap, Crown, ArrowRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import SEOHead from '@/components/SEOHead';

const Pricing = () => {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const features = {
    free: [
      { name: 'Tạo CV cơ bản', included: true },
      { name: '1 CV template', included: true },
      { name: 'Xuất PDF', included: true },
      { name: 'Lưu CV không giới hạn', included: true },
      { name: 'AI Interview Practice', included: false },
      { name: 'AI CV Enhancement', included: false },
      { name: 'AI Job Matching', included: false },
      { name: 'Nhiều CV templates', included: false },
      { name: 'Priority Support', included: false },
      { name: 'Advanced Analytics', included: false },
    ],
    premium: [
      { name: 'Tất cả tính năng Free', included: true },
      { name: 'AI Interview Practice', included: true },
      { name: 'AI CV Enhancement', included: true },
      { name: 'AI Job Matching', included: true },
      { name: '10+ CV templates', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Export nhiều định dạng', included: true },
      { name: 'Custom branding', included: true },
      { name: 'Unlimited AI suggestions', included: true },
    ],
  };

  const pricing = {
    monthly: {
      free: 0,
      premium: 199000,
    },
    yearly: {
      free: 0,
      premium: 1990000, // ~166k/tháng
    },
  };

  const handleSubscribe = (plan: 'free' | 'premium') => {
    if (plan === 'free') {
      navigate(user ? '/dashboard' : '/register');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    navigate('/profile');
  };

  return (
    <>
      <SEOHead 
        title="Bảng Giá - CV Mate" 
        description="So sánh các gói dịch vụ Free và Premium của CV Mate"
      />
      <MainLayout layoutMode="full-width" showLeftSidebar={false} showRightSidebar={false}>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 lg:py-20">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12 lg:mb-16"
            >
              <h1 className="text-heading-1 mb-4">
                Chọn Gói Phù Hợp Với Bạn
              </h1>
              <p className="text-body text-lg max-w-2xl mx-auto mb-8">
                So sánh các tính năng và chọn gói phù hợp với nhu cầu của bạn
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-4 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-crimson-red text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Hàng tháng
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 rounded-md font-semibold transition-all relative ${
                    billingCycle === 'yearly'
                      ? 'bg-crimson-red text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Hàng năm
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    -17%
                  </span>
                </button>
              </div>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="card-base relative"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4">
                    <Zap className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h2 className="text-heading-2 mb-2">Free</h2>
                  <div className="mb-4">
                    <span className="text-4xl font-black text-jet-black dark:text-white">
                      {pricing[billingCycle].free === 0 ? 'Miễn phí' : `${(pricing[billingCycle].free / 1000).toLocaleString('vi-VN')}k`}
                    </span>
                    {pricing[billingCycle].free > 0 && (
                      <span className="text-gray-600 dark:text-gray-400">/{billingCycle === 'monthly' ? 'tháng' : 'năm'}</span>
                    )}
                  </div>
                  <p className="text-body-sm text-gray-600 dark:text-gray-400">
                    Hoàn hảo để bắt đầu
                  </p>
                </div>

                <Button
                  onClick={() => handleSubscribe('free')}
                  variant="outline"
                  className="w-full mb-8 h-12 border-2 border-gray-300 dark:border-gray-600 hover:border-crimson-red dark:hover:border-red-500"
                >
                  Bắt đầu miễn phí
                </Button>

                <ul className="space-y-4">
                  {features.free.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-body-sm ${feature.included ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600 line-through'}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card-base relative border-2 border-crimson-red dark:border-red-500 shadow-xl scale-105"
              >
                {/* Popular Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-crimson-red to-fire-red text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Phổ biến nhất
                  </span>
                </div>

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-crimson-red to-fire-red rounded-xl mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-heading-2 mb-2">Premium</h2>
                  <div className="mb-4">
                    <span className="text-4xl font-black text-crimson-red dark:text-red-400">
                      {billingCycle === 'monthly' 
                        ? `${(pricing.monthly.premium / 1000).toLocaleString('vi-VN')}k`
                        : `${(pricing.yearly.premium / 1000).toLocaleString('vi-VN')}k`
                      }
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/{billingCycle === 'monthly' ? 'tháng' : 'năm'}</span>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Tiết kiệm ~33k/tháng
                      </div>
                    )}
                  </div>
                  <p className="text-body-sm text-gray-600 dark:text-gray-400">
                    Tất cả tính năng AI mạnh mẽ
                  </p>
                </div>

                <Button
                  onClick={() => handleSubscribe('premium')}
                  className="w-full mb-8 h-12 bg-gradient-to-r from-crimson-red to-fire-red hover:from-fire-red hover:to-crimson-red text-white shadow-lg"
                >
                  Nâng cấp ngay
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <ul className="space-y-4">
                  {features.premium.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-body-sm text-gray-900 dark:text-white">
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16 lg:mt-20"
            >
              <h2 className="text-heading-2 text-center mb-8">So sánh chi tiết</h2>
              <div className="card-base overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 font-semibold text-jet-black dark:text-white">Tính năng</th>
                      <th className="text-center py-4 px-4 font-semibold text-jet-black dark:text-white">Free</th>
                      <th className="text-center py-4 px-4 font-semibold text-crimson-red dark:text-red-400">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Tạo CV cơ bản', free: true, premium: true },
                      { feature: 'Số lượng CV templates', free: '1', premium: '10+' },
                      { feature: 'Xuất PDF', free: true, premium: true },
                      { feature: 'Lưu CV không giới hạn', free: true, premium: true },
                      { feature: 'AI Interview Practice', free: false, premium: true },
                      { feature: 'AI CV Enhancement', free: false, premium: true },
                      { feature: 'AI Job Matching', free: false, premium: true },
                      { feature: 'Export nhiều định dạng', free: false, premium: true },
                      { feature: 'Priority Support', free: false, premium: true },
                      { feature: 'Advanced Analytics', free: false, premium: true },
                      { feature: 'Custom branding', free: false, premium: true },
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-4 text-body-sm text-gray-900 dark:text-white">{row.feature}</td>
                        <td className="py-4 px-4 text-center">
                          {typeof row.free === 'boolean' ? (
                            row.free ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                            )
                          ) : (
                            <span className="text-body-sm text-gray-900 dark:text-white">{row.free}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {typeof row.premium === 'boolean' ? (
                            row.premium ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                            )
                          ) : (
                            <span className="text-body-sm text-crimson-red dark:text-red-400 font-semibold">{row.premium}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16 lg:mt-20"
            >
              <h2 className="text-heading-2 text-center mb-8">Câu hỏi thường gặp</h2>
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {[
                  {
                    q: 'Tôi có thể nâng cấp hoặc hủy bất cứ lúc nào không?',
                    a: 'Có, bạn có thể nâng cấp hoặc hủy gói Premium bất cứ lúc nào. Không có phí hủy.',
                  },
                  {
                    q: 'Gói Free có giới hạn gì không?',
                    a: 'Gói Free cho phép bạn tạo và lưu CV không giới hạn, nhưng không có các tính năng AI.',
                  },
                  {
                    q: 'Tính năng AI hoạt động như thế nào?',
                    a: 'AI Interview Practice giúp bạn luyện phỏng vấn với nhiều persona khác nhau. AI CV Enhancement cải thiện nội dung CV của bạn. AI Job Matching phân tích độ phù hợp giữa CV và công việc.',
                  },
                  {
                    q: 'Thanh toán được xử lý như thế nào?',
                    a: 'Chúng tôi hỗ trợ thanh toán qua Stripe và PayPal. Tất cả giao dịch đều được mã hóa và bảo mật.',
                  },
                ].map((faq, index) => (
                  <div key={index} className="card-base">
                    <h3 className="font-semibold text-jet-black dark:text-white mb-2">{faq.q}</h3>
                    <p className="text-body-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Pricing;
