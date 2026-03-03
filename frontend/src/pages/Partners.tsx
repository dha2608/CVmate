import MainLayout from '@/components/layout/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Handshake, Building2 } from 'lucide-react';

const Partners = () => {
  return (
    <>
      <SEOHead
        title="Partners - CV Mate"
        description="Partners and organizations collaborating with CV Mate."
      />
      <MainLayout layoutMode="centered" showRightSidebar={false}>
        <div className="py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Handshake className="w-8 h-8 text-crimson-red" />
              <h1 className="text-3xl font-black text-jet-black">Đối tác</h1>
            </div>

            <p className="text-gray-600 mb-6">
              CV Mate hợp tác với các trường đại học, trung tâm đào tạo và doanh nghiệp để mang lại nhiều cơ hội hơn
              cho người dùng.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-jet-black mb-3">Mô hình hợp tác</h2>
              <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                <li>Cung cấp tài khoản Premium cho sinh viên và học viên.</li>
                <li>Tổ chức workshop về CV, phỏng vấn và định hướng nghề nghiệp.</li>
                <li>Tích hợp API / white‑label cho các nền tảng tuyển dụng.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-jet-black mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-crimson-red" />
                Trở thành đối tác
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                Nếu bạn đại diện cho một trường học, tổ chức hoặc doanh nghiệp quan tâm đến hợp tác, hãy liên hệ:
              </p>
              <p className="text-sm text-gray-700">
                Email:{' '}
                <a href="mailto:partners@cvmate.com" className="text-crimson-red hover:underline">
                  partners@cvmate.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Partners;

