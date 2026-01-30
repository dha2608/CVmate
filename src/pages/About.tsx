import MainLayout from '@/components/layout/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Users, Target, Zap, Heart } from 'lucide-react';

const About = () => {
  return (
    <>
      <SEOHead 
        title="About Us - CV Mate" 
        description="Learn about CV Mate - AI-powered career platform"
      />
      <MainLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-fade-in">
            <h1 className="text-4xl font-black text-jet-black mb-4">About CV Mate</h1>
            <p className="text-xl text-gray-600 mb-8">
              Nền tảng AI-powered giúp bạn tạo CV chuyên nghiệp và phát triển sự nghiệp
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-crimson-red" />
                  Our Mission
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  CV Mate được tạo ra với sứ mệnh giúp mọi người tìm được công việc mơ ước của mình. 
                  Chúng tôi tin rằng mọi người đều xứng đáng có một CV chuyên nghiệp và cơ hội để thể hiện 
                  khả năng của mình trong các cuộc phỏng vấn.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-crimson-red" />
                  What We Offer
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">AI CV Builder</h3>
                    <p className="text-sm text-gray-600">
                      Tạo CV chuẩn ATS trong vài phút với sự hỗ trợ của AI
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">Interview Practice</h3>
                    <p className="text-sm text-gray-600">
                      Luyện tập phỏng vấn với các AI personas khác nhau
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">ATS Checker</h3>
                    <p className="text-sm text-gray-600">
                      Kiểm tra và tối ưu CV của bạn cho hệ thống ATS
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">Career Community</h3>
                    <p className="text-sm text-gray-600">
                      Kết nối với cộng đồng và học hỏi từ các chuyên gia
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-crimson-red" />
                  Our Team
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Chúng tôi là một nhóm các nhà phát triển và chuyên gia về nghề nghiệp, 
                  đam mê giúp mọi người đạt được mục tiêu nghề nghiệp của họ. 
                  Chúng tôi kết hợp công nghệ AI tiên tiến với hiểu biết sâu sắc về thị trường việc làm 
                  để tạo ra một nền tảng mạnh mẽ và dễ sử dụng.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-crimson-red" />
                  Our Values
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Innovation:</strong> Luôn tìm cách cải thiện và đổi mới</li>
                  <li><strong>Accessibility:</strong> Làm cho công cụ tạo CV trở nên dễ tiếp cận với mọi người</li>
                  <li><strong>Quality:</strong> Cam kết cung cấp dịch vụ chất lượng cao</li>
                  <li><strong>User-Centric:</strong> Đặt người dùng làm trung tâm của mọi quyết định</li>
                </ul>
              </section>

              <section className="bg-crimson-red/10 p-6 rounded-lg border border-crimson-red/20">
                <h2 className="text-2xl font-bold text-jet-black mb-4">Get in Touch</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Bạn có câu hỏi hoặc gợi ý? Chúng tôi rất muốn nghe từ bạn!
                </p>
                <p className="text-gray-700">
                  Email: <a href="mailto:contact@cvmate.com" className="text-crimson-red hover:underline">contact@cvmate.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default About;
