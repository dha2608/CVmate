import { Link } from 'react-router-dom';
import { useI18n } from '@/store/i18nStore';
import { FileText, Video, Users, Briefcase, BookOpen, HelpCircle, Mail, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  const { t } = useI18n();
  
  return (
    <footer id="footer" role="contentinfo" className="bg-jet-black text-white border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-crimson-red rounded-lg text-white font-black text-xl flex items-center justify-center">
                CV
              </div>
              <span className="text-xl font-bold">CV Mate</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-crimson-red transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-crimson-red transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-crimson-red transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-crimson-red transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Briefcase size={18} />
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/builder" className="text-gray-400 hover:text-crimson-red transition-colors flex items-center gap-2">
                  <FileText size={14} />
                  {t('footer.cvBuilder')}
                </Link>
              </li>
              <li>
                <Link to="/interview" className="text-gray-400 hover:text-crimson-red transition-colors flex items-center gap-2">
                  <Video size={14} />
                  {t('footer.interviewPractice')}
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-gray-400 hover:text-crimson-red transition-colors flex items-center gap-2">
                  <Briefcase size={14} />
                  {t('footer.jobSearch')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-crimson-red transition-colors flex items-center gap-2">
                  <BookOpen size={14} />
                  {t('footer.careerBlog')}
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-400 hover:text-crimson-red transition-colors flex items-center gap-2">
                  <Users size={14} />
                  {t('footer.community')}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-crimson-red transition-colors flex items-center gap-2">
                  <Briefcase size={14} />
                  {t('footer.pricing')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-white mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/about" className="hover:text-crimson-red transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-crimson-red transition-colors">
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-crimson-red transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-crimson-red transition-colors">
                  {t('footer.careers')}
                </Link>
              </li>
              <li>
                <Link to="/partners" className="hover:text-crimson-red transition-colors">
                  {t('footer.partners')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="font-bold text-white mb-4">{t('footer.legalSupport')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/terms" className="hover:text-crimson-red transition-colors">
                  {t('footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-crimson-red transition-colors">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-crimson-red transition-colors">
                  {t('footer.cookiePolicy')}
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-crimson-red transition-colors flex items-center gap-2">
                  <HelpCircle size={14} />
                  {t('footer.helpCenter')}
                </Link>
              </li>
              <li>
                <a href="mailto:support@cvmate.com" className="hover:text-crimson-red transition-colors flex items-center gap-2">
                  <Mail size={14} />
                  support@cvmate.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div>
              © {new Date().getFullYear()} CV Mate. {t('footer.allRightsReserved')}
            </div>
            <div className="flex gap-6">
              <Link to="/sitemap" className="hover:text-crimson-red transition-colors">
                {t('footer.sitemap')}
              </Link>
              <Link to="/accessibility" className="hover:text-crimson-red transition-colors">
                {t('footer.accessibility')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
