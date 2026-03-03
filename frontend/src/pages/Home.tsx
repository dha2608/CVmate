import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useI18n } from '@/store/i18nStore';

import { useAuthStore } from '@/store/authStore';

import { useTheme } from '@/hooks/useTheme';

import { Button } from '@/components/ui/button';

import SEOHead from '@/components/SEOHead';

import {
  Brain,
  FileText,
  Video,
  Users,
  ArrowRight,
  Check,
  BookOpen,
  ExternalLink,
  Moon,
  Sun,
} from 'lucide-react';

import { motion } from 'framer-motion';

import { api } from '@/lib/utils';

const Home = () => {
  const { t } = useI18n();

  const { user } = useAuthStore();

  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();

  const [latestArticles, setLatestArticles] = useState<any[]>([]);

  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLatestArticles = async () => {
      try {
        const response = await api.getArticles();

        if (!isMounted) return;

        if (response.success && Array.isArray(response.data)) {
          setLatestArticles(response.data.slice(0, 3)); // Get latest 3 articles
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        if (isMounted) {
          setLoadingArticles(false);
        }
      }
    };

    fetchLatestArticles();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <SEOHead
        title={t('home.seoTitle') || 'CV Mate - Build ATS-Ready CVs & Practice Interviews with AI'}
        description={
          t('home.seoDescription') ||
          'All-in-one career platform. Build ATS-optimized CVs in 5 minutes, practice interviews with AI, and connect with the community.'
        }
      />

      <div className="min-h-screen text-slate-900 dark:text-white page-fade-in flex flex-col">
        {/* Top Marketing Navbar */}

        <header className="sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 group">
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-crimson-red rounded-lg text-white font-black text-base sm:text-lg shadow-sm group-hover:shadow-md transition-shadow">
                CV
              </div>

              <span className="hidden sm:inline text-sm sm:text-base font-semibold tracking-tight">
                CV Mate
              </span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                className="rounded-full"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {user ? (
                <Button
                  size="sm"
                  className="bg-crimson-red hover:bg-fire-red text-white rounded-full px-4 sm:px-5"
                  onClick={() => navigate('/dashboard')}
                >
                  {t('home.goToDashboard') || 'Go to Dashboard'}
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full px-3 sm:px-4"
                    onClick={() => navigate('/login')}
                  >
                    {t('home.signIn')}
                  </Button>

                  <Button
                    size="sm"
                    className="bg-crimson-red hover:bg-fire-red text-white rounded-full px-4 sm:px-5"
                    onClick={() => navigate(user ? '/dashboard' : '/register')}
                  >
                    {t('home.getStartedFree')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}

        <section className="relative overflow-hidden flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Logo/Brand */}

              <div className="inline-flex items-center justify-center w-20 h-20 bg-crimson-red rounded-2xl text-white font-black text-3xl mb-8 shadow-lg">
                CV
              </div>

              {/* Main Headline */}

              <motion.h1
                className="text-5xl md:text-7xl font-black text-jet-black dark:text-white mb-6 leading-tight tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {t('home.heroTitle')}

                <br />

                <motion.span
                  className="text-crimson-red"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {t('home.heroSubtitle')}
                </motion.span>
              </motion.h1>

              {/* Subheadline */}

              <motion.p
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {t('home.heroDescription')}
              </motion.p>

              {/* CTA Buttons */}

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button
                  size="lg"
                  className="bg-crimson-red hover:bg-fire-red text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl hover-lift transition-all duration-300"
                  onClick={() => navigate('/register')}
                >
                  {t('home.getStartedFree')}

                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-jet-black dark:border-gray-300 text-jet-black dark:text-gray-200 hover:bg-jet-black hover:text-white dark:hover:bg-white dark:hover:text-jet-black px-8 py-6 text-lg font-semibold rounded-lg hover-lift transition-all duration-300"
                  onClick={() => navigate('/login')}
                >
                  {t('home.signIn')}
                </Button>
              </motion.div>

              {/* Trust Indicators */}

              <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-crimson-red" />

                  <span>{t('home.noCreditCard')}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-crimson-red" />

                  <span>{t('home.atsOptimized')}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-crimson-red" />

                  <span>{t('home.aiPowered')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements - Minimalist */}

          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute top-20 right-10 w-72 h-72 bg-light-grey dark:bg-gray-800 rounded-full opacity-30 blur-3xl"></div>

            <div className="absolute bottom-20 left-10 w-96 h-96 bg-light-grey dark:bg-gray-800 rounded-full opacity-20 blur-3xl"></div>
          </div>
        </section>

        {/* Features Section */}

        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-jet-black dark:text-white mb-4">
                {t('home.everythingYouNeed')}
              </h2>

              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('home.allInOnePlatform')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Feature 1: CV Builder */}

              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <FeatureCard
                  icon={<FileText className="w-8 h-8" />}
                  title={t('home.aiCVBuilder')}
                  description={t('home.aiCVBuilderDesc')}
                  color="text-crimson-red"
                />
              </div>

              {/* Feature 2: Interview Simulator */}

              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <FeatureCard
                  icon={<Video className="w-8 h-8" />}
                  title={t('home.aiInterviewPractice')}
                  description={t('home.aiInterviewPracticeDesc')}
                  color="text-crimson-red"
                />
              </div>

              {/* Feature 3: Community */}

              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <FeatureCard
                  icon={<Users className="w-8 h-8" />}
                  title={t('home.careerCommunity')}
                  description={t('home.careerCommunityDesc')}
                  color="text-crimson-red"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}

        <section className="py-24 bg-light-grey dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-jet-black dark:text-white mb-4">
                {t('home.howItWorks')}
              </h2>

              <p className="text-xl text-gray-600 dark:text-gray-400">
                {t('home.simpleFastEffective')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              <StepCard number="1" title={t('home.signUp')} description={t('home.signUpDesc')} />

              <StepCard
                number="2"
                title={t('home.buildYourCV')}
                description={t('home.buildYourCVDesc')}
              />

              <StepCard
                number="3"
                title={t('home.practiceApply')}
                description={t('home.practiceApplyDesc')}
              />
            </div>
          </div>
        </section>

        {/* Latest Articles Section */}

        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-4">
                <BookOpen className="w-8 h-8 text-crimson-red" />

                <h2 className="text-4xl md:text-5xl font-black text-jet-black dark:text-white">
                  {t('home.latestCareerInsights')}
                </h2>
              </div>

              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('home.readLatestArticles')}
              </p>
            </div>

            {loadingArticles ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg h-64 animate-pulse"
                  />
                ))}
              </div>
            ) : latestArticles.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {latestArticles.map((article, index) => (
                  <article
                    key={article._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover-lift transition-all duration-300 cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => navigate(`/blog/${article._id}`)}
                  >
                    {article.image || article.coverImage ? (
                      <div className="h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
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

                      <h3 className="text-lg font-bold text-jet-black dark:text-white mb-3 leading-tight line-clamp-2 hover:text-crimson-red transition-colors">
                        {article.title}
                      </h3>

                      {article.summary && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                          {article.summary}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-sm font-semibold text-crimson-red hover:text-fire-red transition-colors">
                        {t('home.readMore')}

                        <ExternalLink size={14} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />

                <p className="text-gray-600 dark:text-gray-400">{t('home.noArticlesYet')}</p>
              </div>
            )}

            {latestArticles.length > 0 && (
              <div className="text-center mt-8">
                <Button
                  onClick={() => navigate('/blog')}
                  variant="outline"
                  className="border-2 border-crimson-red text-crimson-red hover:bg-crimson-red hover:text-white"
                >
                  {t('home.viewAllArticles')}

                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}

        <section className="py-24 bg-jet-black text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Brain className="w-16 h-16 mx-auto mb-6 text-crimson-red" />

            <h2 className="text-4xl md:text-5xl font-black mb-6">{t('home.readyToLand')}</h2>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {t('home.joinThousands')}
            </p>

            <Button
              size="lg"
              className="bg-crimson-red hover:bg-fire-red text-white px-10 py-6 text-lg font-semibold rounded-lg"
              onClick={() => navigate('/register')}
            >
              {t('home.startBuildingNow')}

              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

const FeatureCard = ({ icon, title, description, color }: any) => (
  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover-lift transition-all duration-300 group">
    <div
      className={`${color} mb-4 inline-flex p-3 rounded-lg bg-light-grey dark:bg-gray-700 group-hover:bg-crimson-red group-hover:text-white transition-all duration-300`}
    >
      {icon}
    </div>

    <h3 className="text-2xl font-bold text-jet-black dark:text-white mb-3 group-hover:text-crimson-red transition-colors duration-300">
      {title}
    </h3>

    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }: any) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-crimson-red text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">
      {number}
    </div>

    <h3 className="text-xl font-bold text-jet-black dark:text-white mb-3">{title}</h3>

    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

export default Home;
