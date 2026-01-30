import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/SEOHead';
import { Sparkles, FileText, Video, Users, ArrowRight, Check } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

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
      <footer className="bg-jet-black text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center justify-center w-12 h-12 bg-crimson-red rounded-lg text-white font-black text-xl mb-4">
                CV
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered career platform helping professionals succeed.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">CV Builder</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Interview Practice</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ATS Checker</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © 2024 CV Mate. All rights reserved.
          </div>
        </div>
      </footer>
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
