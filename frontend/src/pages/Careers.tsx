import MainLayout from '@/components/layout/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Briefcase, Users, Target } from 'lucide-react';

const Careers = () => {
  return (
    <>
      <SEOHead
        title="Careers - CV Mate"
        description="Join the CV Mate team and help people grow their careers."
      />
      <MainLayout layoutMode="centered" showRightSidebar={false}>
        <div className="py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-8 h-8 text-crimson-red" />
              <h1 className="text-3xl font-black text-jet-black">Tuyển dụng</h1>
            </div>

            <p className="text-gray-600 mb-6">
              Chúng tôi luôn tìm kiếm những người tài năng, đam mê giáo dục và công nghệ để cùng xây dựng CV Mate.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-jet-black mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-crimson-red" />
                Sứ mệnh tuyển dụng
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                Mục tiêu của chúng tôi là giúp hàng triệu người tìm được công việc mơ ước thông qua CV, luyện phỏng vấn
                và cộng đồng hỗ trợ. Nếu bạn muốn tạo ra tác động thật sự cho người dùng, CV Mate là nơi dành cho bạn.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-jet-black mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-crimson-red" />
                Vị trí mở (demo)
              </h2>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-jet-black">Frontend Engineer (React / TypeScript)</p>
                    <p className="text-gray-500 text-xs">TP. Hồ Chí Minh · Hybrid</p>
                  </div>
                  <span className="text-crimson-red text-xs font-medium">Đang mở</span>
                </li>
                <li className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-jet-black">Product Designer</p>
                    <p className="text-gray-500 text-xs">Remote · Part-time</p>
                  </div>
                  <span className="text-gray-400 text-xs font-medium">Sắp tuyển</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-jet-black mb-3">Ứng tuyển</h2>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                Gửi CV và portfolio của bạn về{' '}
                <a href="mailto:careers@cvmate.com" className="text-crimson-red hover:underline">
                  careers@cvmate.com
                </a>{' '}
                với tiêu đề email: <strong>[Vị trí] - Họ tên</strong>.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Nếu chưa có vị trí phù hợp, bạn vẫn có thể gửi CV để chúng tôi lưu lại cho các cơ hội trong tương lai.
              </p>
            </section>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Careers;

