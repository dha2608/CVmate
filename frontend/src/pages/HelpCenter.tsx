import MainLayout from '@/components/layout/MainLayout';
import SEOHead from '@/components/SEOHead';
import { HelpCircle, MessageCircle, ShieldCheck, FileText, CreditCard } from 'lucide-react';

const HelpCenter = () => {
  return (
    <>
      <SEOHead
        title="Help Center - CV Mate"
        description="Help Center for CV Mate: FAQs, troubleshooting, and support contact."
      />
      <MainLayout layoutMode="centered" showRightSidebar={false}>
        <div className="py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-8 h-8 text-crimson-red" />
              <h1 className="text-3xl font-black text-jet-black">Help Center</h1>
            </div>

            <p className="text-gray-600 mb-8">
              Tìm câu trả lời nhanh cho các câu hỏi thường gặp hoặc liên hệ đội ngũ hỗ trợ của CV Mate.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <a
                href="#account"
                className="border border-gray-200 rounded-lg p-4 hover:border-crimson-red hover:shadow-sm transition-colors flex items-start gap-3"
              >
                <ShieldCheck className="w-5 h-5 text-crimson-red mt-1" />
                <div>
                  <h2 className="font-semibold text-jet-black mb-1">Tài khoản & Đăng nhập</h2>
                  <p className="text-sm text-gray-600">
                    Vấn đề về đăng nhập, Google OAuth, bảo mật tài khoản.
                  </p>
                </div>
              </a>
              <a
                href="#ai"
                className="border border-gray-200 rounded-lg p-4 hover:border-crimson-red hover:shadow-sm transition-colors flex items-start gap-3"
              >
                <FileText className="w-5 h-5 text-crimson-red mt-1" />
                <div>
                  <h2 className="font-semibold text-jet-black mb-1">Tính năng AI</h2>
                  <p className="text-sm text-gray-600">
                    Luyện phỏng vấn AI, nâng cấp CV, lỗi API key hoặc rate limit.
                  </p>
                </div>
              </a>
              <a
                href="#billing"
                className="border border-gray-200 rounded-lg p-4 hover:border-crimson-red hover:shadow-sm transition-colors flex items-start gap-3"
              >
                <CreditCard className="w-5 h-5 text-crimson-red mt-1" />
                <div>
                  <h2 className="font-semibold text-jet-black mb-1">Thanh toán & Premium</h2>
                  <p className="text-sm text-gray-600">
                    Nâng cấp gói, lịch sử thanh toán, hủy gia hạn.
                  </p>
                </div>
              </a>
              <a
                href="#contact"
                className="border border-gray-200 rounded-lg p-4 hover:border-crimson-red hover:shadow-sm transition-colors flex items-start gap-3"
              >
                <MessageCircle className="w-5 h-5 text-crimson-red mt-1" />
                <div>
                  <h2 className="font-semibold text-jet-black mb-1">Liên hệ hỗ trợ</h2>
                  <p className="text-sm text-gray-600">
                    Gửi email cho đội ngũ hỗ trợ hoặc báo cáo lỗi.
                  </p>
                </div>
              </a>
            </div>

            <div className="space-y-8">
              <section id="account">
                <h2 className="text-2xl font-bold text-jet-black mb-3">
                  1. Tài khoản & Đăng nhập
                </h2>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>
                    <strong>Không đăng nhập được bằng Google?</strong> Kiểm tra lại rằng bạn đã cấu hình{' '}
                    <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code> và{' '}
                    <code>GOOGLE_CALLBACK_URL</code> đúng trong file <code>.env</code> backend và khởi động lại server.
                  </li>
                  <li>
                    <strong>Bị đăng xuất liên tục?</strong> Hãy chắc chắn trình duyệt không chặn cookies và thời gian
                    trên máy tính đúng.
                  </li>
                </ul>
              </section>

              <section id="ai">
                <h2 className="text-2xl font-bold text-jet-black mb-3">
                  2. Tính năng AI (Interview, CV, Article)
                </h2>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>
                    <strong>Lỗi 401 / API key invalid:</strong> Kiểm tra lại giá trị{' '}
                    <code>HF_API_KEY</code> trong file <code>.env</code> backend, đảm bảo không có khoảng trắng
                    thừa và khởi động lại server.
                  </li>
                  <li>
                    <strong>Lỗi 429 / Rate limit exceeded:</strong> Điều này thường xảy ra khi tài khoản Hugging Face
                    chưa được cấp đủ quota hoặc vượt giới hạn. Vào{' '}
                    <a
                      href="https://huggingface.co/settings/tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="text-crimson-red hover:underline"
                    >
                      trang Tokens / Billing
                    </a>{' '}
                    để kiểm tra credits & quota. Nếu dùng gói free, hãy chờ vài phút rồi thử lại hoặc nâng cấp tài khoản.
                  </li>
                  <li>
                    <strong>Gợi ý:</strong> Hạn chế spam nhiều câu hỏi liên tiếp, mỗi phiên nên gửi từng câu một để
                    tránh chạm rate limit.
                  </li>
                </ul>
              </section>

              <section id="billing">
                <h2 className="text-2xl font-bold text-jet-black mb-3">
                  3. Thanh toán & Gói Premium
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Nếu bạn gặp vấn đề khi thanh toán hoặc nâng cấp gói, hãy kiểm tra lại thông tin thẻ, kết nối mạng và
                  thử lại sau vài phút. Nếu vẫn lỗi, gửi email kèm ảnh chụp màn hình tới{' '}
                  <a href="mailto:billing@cvmate.com" className="text-crimson-red hover:underline">
                    billing@cvmate.com
                  </a>
                  .
                </p>
              </section>

              <section id="contact">
                <h2 className="text-2xl font-bold text-jet-black mb-3">
                  4. Liên hệ trực tiếp
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  Nếu không tìm thấy câu trả lời, bạn có thể liên hệ trực tiếp:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                  <li>
                    Email hỗ trợ chung:{' '}
                    <a href="mailto:support@cvmate.com" className="text-crimson-red hover:underline">
                      support@cvmate.com
                    </a>
                  </li>
                  <li>
                    Email kỹ thuật:{' '}
                    <a href="mailto:dev@cvmate.com" className="text-crimson-red hover:underline">
                      dev@cvmate.com
                    </a>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default HelpCenter;

