import MainLayout from '@/components/layout/MainLayout';
import SEOHead from '@/components/SEOHead';
import { FileText } from 'lucide-react';

const Terms = () => {
  return (
    <>
      <SEOHead 
        title="Terms of Service - CV Mate" 
        description="Terms of Service for CV Mate platform"
      />
      <MainLayout layoutMode="centered" showLeftSidebar={false} showRightSidebar={false}>
        <div className="py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-crimson-red" />
              <h1 className="text-3xl font-black text-jet-black">Terms of Service</h1>
            </div>
            
            <div className="text-sm text-gray-500 mb-8">
              Last updated: {new Date().toLocaleDateString('vi-VN')}
            </div>

            <div className="prose prose-gray max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using CV Mate, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4">2. Use License</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Permission is granted to temporarily use CV Mate for personal, non-commercial transitory viewing only. 
                  This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on CV Mate</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4">3. User Accounts</h2>
                <p className="text-gray-700 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account and password. 
                  You agree to accept responsibility for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4">4. Premium Subscription</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Premium subscriptions are billed monthly. You may cancel your subscription at any time, 
                  and you will continue to have access to premium features until the end of your billing period.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4">5. Content and Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed">
                  All content on CV Mate, including but not limited to text, graphics, logos, and software, 
                  is the property of CV Mate and is protected by copyright and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4">6. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  CV Mate shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4">7. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  CV Mate reserves the right to revise these terms at any time without notice. 
                  By using this website you are agreeing to be bound by the then current version of these Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-jet-black mb-4">8. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:legal@cvmate.com" className="text-crimson-red hover:underline">
                    legal@cvmate.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Terms;
