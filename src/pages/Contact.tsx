import MainLayout from '@/components/layout/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <>
      <SEOHead
        title="Contact - CV Mate"
        description="Contact CV Mate team for support, partnership, and general inquiries."
      />
      <MainLayout layoutMode="centered" showLeftSidebar={false} showRightSidebar={false}>
        <div className="py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-fade-in">
            <h1 className="text-3xl font-black text-jet-black mb-4">Liên hệ</h1>
            <p className="text-gray-600 mb-8">
              Gửi cho chúng tôi câu hỏi, góp ý hoặc cơ hội hợp tác. Chúng tôi sẽ phản hồi trong vòng 1–2 ngày làm việc.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-crimson-red mt-1" />
                  <div>
                    <h2 className="font-semibold text-jet-black">Email</h2>
                    <p className="text-sm text-gray-700">
                      Hỗ trợ chung:{' '}
                      <a href="mailto:support@cvmate.com" className="text-crimson-red hover:underline">
                        support@cvmate.com
                      </a>
                    </p>
                    <p className="text-sm text-gray-700">
                      Hợp tác & đối tác:{' '}
                      <a href="mailto:partners@cvmate.com" className="text-crimson-red hover:underline">
                        partners@cvmate.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-crimson-red mt-1" />
                  <div>
                    <h2 className="font-semibold text-jet-black">Điện thoại</h2>
                    <p className="text-sm text-gray-700">
                      +84 (0) 000 000 000 <span className="text-gray-400">(Giờ làm việc: 9:00–18:00, Thứ 2–Thứ 6)</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-crimson-red mt-1" />
                  <div>
                    <h2 className="font-semibold text-jet-black">Văn phòng</h2>
                    <p className="text-sm text-gray-700">
                      CV Mate, Quận 1, TP. Hồ Chí Minh (địa chỉ demo cho mục đích UI).
                    </p>
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red"
                    placeholder="Nhập họ tên của bạn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-crimson-red"
                    placeholder="Mô tả vấn đề hoặc yêu cầu của bạn..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 bg-crimson-red text-white rounded-md text-sm font-medium hover:bg-fire-red transition-colors"
                >
                  Gửi tin nhắn
                </button>
              </form>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Contact;

