import MainLayout from '@/components/layout/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Network } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sitemap = () => {
  const sections = [
    {
      title: 'Sản phẩm',
      links: [
        { to: '/', label: 'Trang chủ' },
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/builder', label: 'Tạo CV' },
        { to: '/interview', label: 'Luyện phỏng vấn' },
        { to: '/jobs', label: 'Việc làm' },
        { to: '/community', label: 'Cộng đồng' },
        { to: '/blog', label: 'Blog sự nghiệp' },
      ],
    },
    {
      title: 'Công ty',
      links: [
        { to: '/about', label: 'Về chúng tôi' },
        { to: '/careers', label: 'Tuyển dụng' },
        { to: '/partners', label: 'Đối tác' },
        { to: '/contact', label: 'Liên hệ' },
      ],
    },
    {
      title: 'Pháp lý & Hỗ trợ',
      links: [
        { to: '/terms', label: 'Điều khoản dịch vụ' },
        { to: '/privacy', label: 'Chính sách bảo mật' },
        { to: '/cookie-policy', label: 'Chính sách Cookie' },
        { to: '/help', label: 'Trung tâm trợ giúp' },
        { to: '/accessibility', label: 'Khả năng truy cập' },
      ],
    },
  ];

  return (
    <>
      <SEOHead title="Sitemap - CV Mate" description="Sitemap giúp bạn xem nhanh cấu trúc website CV Mate." />
      <MainLayout layoutMode="centered" showRightSidebar={false}>
        <div className="py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Network className="w-8 h-8 text-crimson-red" />
              <h1 className="text-3xl font-black text-jet-black">Sitemap</h1>
            </div>

            <p className="text-gray-600 mb-8">
              Tổng quan cấu trúc các trang trên CV Mate để bạn dễ dàng điều hướng và kiểm tra khả năng truy cập.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="font-semibold text-jet-black mb-3">{section.title}</h2>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {section.links.map((link) => (
                      <li key={link.to}>
                        <Link to={link.to} className="hover:text-crimson-red transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Sitemap;

