import MainLayout from '@/components/layout/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Cookie } from 'lucide-react';

const CookiePolicy = () => {
  return (
    <>
      <SEOHead
        title="Cookie Policy - CV Mate"
        description="Cookie Policy explaining how CV Mate uses cookies and similar technologies."
      />
      <MainLayout layoutMode="centered" showRightSidebar={false}>
        <div className="py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Cookie className="w-8 h-8 text-crimson-red" />
              <h1 className="text-3xl font-black text-jet-black">Cookie Policy</h1>
            </div>

            <div className="text-sm text-gray-500 mb-8">
              Last updated: {new Date().toLocaleDateString('vi-VN')}
            </div>

            <div className="prose prose-gray max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4">1. What Are Cookies?</h2>
                <p className="text-gray-700 leading-relaxed">
                  Cookies are small text files that are stored on your device when you visit a website.
                  They help the website remember your actions and preferences over a period of time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4">2. How We Use Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  CV Mate uses cookies and similar technologies for the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>To keep you signed in and maintain your session.</li>
                  <li>To remember your language and theme preferences.</li>
                  <li>To analyze how you use the platform and improve our services.</li>
                  <li>To provide security features and prevent fraudulent activity.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4">3. Types of Cookies We Use</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Essential cookies:</strong> Required for the platform to function (authentication, security, basic features).
                  </li>
                  <li>
                    <strong>Preference cookies:</strong> Remember your settings such as language, theme, and saved filters.
                  </li>
                  <li>
                    <strong>Analytics cookies:</strong> Help us understand how users interact with CV Mate so we can improve the experience.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4">4. Managing Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Most browsers allow you to control cookies through their settings. You can choose to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Delete existing cookies from your device.</li>
                  <li>Block all cookies or only third‑party cookies.</li>
                  <li>Receive a notification before a cookie is stored.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-2">
                  If you disable essential cookies, some features of CV Mate may not work properly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4">5. Contact</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about this Cookie Policy, please contact us at{' '}
                  <a href="mailto:privacy@cvmate.com" className="text-crimson-red hover:underline">
                    privacy@cvmate.com
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default CookiePolicy;

