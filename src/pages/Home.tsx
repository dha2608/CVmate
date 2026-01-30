import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/SEOHead';
import { Sparkles, FileText, Video, Users, ArrowRight, Check, BookOpen, ExternalLink } from 'lucide-react';
import { api } from '@/lib/utils';
import Footer from '@/components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const [latestArticles, setLatestArticles] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        const response = await api.getArticles();
        if (response.success) {
          setLatestArticles(response.data.slice(0, 3)); // Get latest 3 articles
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoadingArticles(false);
      }
    };
    fetchLatestArticles();
  }, []);

  return (
    <>
      <SEOHead 
        title="CV Mate - Tạo CV chuẩn ATS và Luyện Phỏng Vấn với AI"
        description="Nền tảng All-in-one hỗ trợ sự nghiệp. Tạo CV chuẩn ATS trong 5 phút, luyện phỏng vấn với AI, và kết nối cộng đồng."
      />
      <div className="min-h-screen bg-white page-transition">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo/Brand */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-crimson-red rounded-2xl text-white font-black text-3xl mb-8 shadow-lg">
              CV
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-black text-jet-black mb-6 leading-tight tracking-tight animate-fade-in">
              Create Your Perfect CV
              <br />
              <span className="text-crimson-red">in Under 5 Minutes</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              AI-powered resume builder that helps you land your dream job. 
              <br className="hidden md:block" />
              ATS-friendly templates. Interview practice. All in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                className="bg-crimson-red hover:bg-fire-red text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl hover-lift transition-all duration-300"
                onClick={() => navigate('/register')}
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-jet-black text-jet-black hover:bg-jet-black hover:text-white px-8 py-6 text-lg font-semibold rounded-lg hover-lift transition-all duration-300"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-crimson-red" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-crimson-red" />
                <span>ATS-Optimized</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-crimson-red" />
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements - Minimalist */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-light-grey rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-light-grey rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-jet-black mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              All-in-one career platform powered by AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1: CV Builder */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <FeatureCard
                icon={<FileText className="w-8 h-8" />}
                title="AI CV Builder"
                description="Create ATS-friendly resumes in minutes. AI enhances your content to make it professional and impactful."
                color="text-crimson-red"
              />
            </div>

            {/* Feature 2: Interview Simulator */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <FeatureCard
                icon={<Video className="w-8 h-8" />}
                title="AI Interview Practice"
                description="Practice with different AI personas - Friendly HR, Strict Manager, or English Native. Get instant feedback."
                color="text-crimson-red"
              />
            </div>

            {/* Feature 3: Community */}
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <FeatureCard
                icon={<Users className="w-8 h-8" />}
                title="Career Community"
                description="Share your CV, get feedback, and connect with professionals. Learn from others' experiences."
                color="text-crimson-red"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-light-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-jet-black mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple. Fast. Effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <StepCard
              number="1"
              title="Sign Up"
              description="Create your free account in seconds. No credit card required."
            />
            <StepCard
              number="2"
              title="Build Your CV"
              description="Use our AI-powered builder to create a professional, ATS-friendly resume."
            />
            <StepCard
              number="3"
              title="Practice & Apply"
              description="Practice interviews with AI, then export your CV and start applying."
            />
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-crimson-red" />
              <h2 className="text-4xl md:text-5xl font-black text-jet-black">
                Latest Career Insights
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Đọc các bài viết mới nhất từ cộng đồng chuyên gia
            </p>
          </div>

          {loadingArticles ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          ) : latestArticles.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {latestArticles.map((article, index) => (
                <article
                  key={article._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover-lift transition-all duration-300 cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/blog/${article._id}`)}
                >
                  {article.image || article.coverImage ? (
                    <div className="h-48 w-full overflow-hidden bg-gray-100">
                      <img
                        src={article.image || article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-crimson-red to-fire-red flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-crimson-red uppercase tracking-wider">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-jet-black mb-3 leading-tight line-clamp-2 hover:text-crimson-red transition-colors">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">{article.summary}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm font-semibold text-crimson-red hover:text-fire-red transition-colors">
                      Đọc thêm
                      <ExternalLink size={14} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Chưa có bài viết nào. Hãy là người đầu tiên viết bài!</p>
            </div>
          )}

          {latestArticles.length > 0 && (
            <div className="text-center mt-8">
              <Button
                onClick={() => navigate('/blog')}
                variant="outline"
                className="border-2 border-crimson-red text-crimson-red hover:bg-crimson-red hover:text-white"
              >
                Xem tất cả bài viết
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-jet-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-crimson-red" />
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have already created their perfect CV with CV Mate.
          </p>
          <Button 
            size="lg" 
            className="bg-crimson-red hover:bg-fire-red text-white px-10 py-6 text-lg font-semibold rounded-lg"
            onClick={() => navigate('/register')}
          >
            Start Building Your CV Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      </div>
    </>
  );
};

const FeatureCard = ({ icon, title, description, color }: any) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl hover-lift transition-all duration-300 group">
    <div className={`${color} mb-4 inline-flex p-3 rounded-lg bg-light-grey group-hover:bg-crimson-red group-hover:text-white transition-all duration-300`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-jet-black mb-3 group-hover:text-crimson-red transition-colors duration-300">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }: any) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-crimson-red text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">
      {number}
    </div>
    <h3 className="text-xl font-bold text-jet-black mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Home;
