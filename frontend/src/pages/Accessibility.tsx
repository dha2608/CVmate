import MainLayout from '@/components/layout/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Accessibility as AccessibilityIcon, Keyboard, Eye, MousePointer } from 'lucide-react';

const Accessibility = () => {
  return (
    <>
      <SEOHead
        title="Accessibility - CV Mate"
        description="Accessibility commitments and features of CV Mate."
      />
      <MainLayout layoutMode="centered" showRightSidebar={false}>
        <div className="py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <AccessibilityIcon className="w-8 h-8 text-crimson-red" />
              <h1 className="text-3xl font-black text-jet-black">Khả năng truy cập</h1>
            </div>

            <p className="text-gray-600 mb-8">
              CV Mate được thiết kế với nhiều tính năng hỗ trợ để mọi người, bao gồm người khuyết tật, có thể sử dụng
              nền tảng một cách thoải mái nhất.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-3 flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-crimson-red" />
                  Điều hướng bằng bàn phím
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                  <li>Hỗ trợ phím Tab / Shift + Tab để di chuyển giữa các phần tử tương tác.</li>
                  <li>Phím Enter / Space để kích hoạt nút và liên kết.</li>
                  <li>Các dialog và bottom sheet sử dụng focus trap để không bị “lọt” ra ngoài.</li>
                  <li>Có liên kết “Skip to content” để bỏ qua navigation và vào thẳng nội dung chính.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-crimson-red" />
                  Tương phản & chế độ tối
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                  <li>Màu sắc được chọn để đảm bảo độ tương phản phù hợp theo tiêu chuẩn WCAG.</li>
                  <li>Có chế độ Dark Mode cho môi trường ánh sáng yếu.</li>
                  <li>Focus state được làm nổi bật rõ ràng cho người dùng bàn phím.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-3 flex items-center gap-2">
                  <MousePointer className="w-5 h-5 text-crimson-red" />
                  Hỗ trợ trình đọc màn hình
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                  <li>Dùng các thẻ HTML sematic (nav, main, footer) và ARIA attributes cho dialog, bottom sheet.</li>
                  <li>Ảnh quan trọng có thuộc tính <code>alt</code> mô tả nội dung.</li>
                  <li>Icon chỉ mang tính trang trí sẽ được ẩn đúng cách khỏi trình đọc màn hình.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-3">Góp ý thêm về khả năng truy cập</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Nếu bạn gặp trở ngại khi sử dụng CV Mate với trình đọc màn hình, bàn phím hoặc công cụ hỗ trợ khác,
                  hãy gửi email cho chúng tôi tại{' '}
                  <a href="mailto:accessibility@cvmate.com" className="text-crimson-red hover:underline">
                    accessibility@cvmate.com
                  </a>
                  . Chúng tôi rất trân trọng mọi góp ý để cải thiện nền tảng.
                </p>
              </section>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Accessibility;

