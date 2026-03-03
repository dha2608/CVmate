import { memo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Lock, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';

interface PremiumGateProps {
  children: ReactNode;
  /**
   * If true, renders children with an overlay blur + upgrade prompt.
   * If false, renders children normally.
   * Default: always checks auth store.
   */
  override?: boolean;
  feature?: string;
  className?: string;
}

/**
 * Wraps premium-only content. Shows a blurred overlay with upgrade prompt
 * for free users. Premium users see the content normally.
 *
 * Usage:
 *   <PremiumGate feature="AI Resume">
 *     <PremiumFeature />
 *   </PremiumGate>
 */
export const PremiumGate = memo(function PremiumGate({
  children,
  override,
  feature,
  className,
}: PremiumGateProps) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { t } = useI18n();

  const isPremium =
    override !== undefined
      ? override
      : user?.subscription?.plan === 'premium' && user.subscription.status === 'active';

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      {/* Blurred preview of the content */}
      <div className="select-none pointer-events-none blur-sm opacity-50 overflow-hidden max-h-40">
        {children}
      </div>

      {/* Overlay */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 z-10"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
              <Lock size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                {feature
                  ? t('pricing.premiumFeature')?.replace('{feature}', feature) ||
                    `${feature} is a Premium feature`
                  : t('pricing.premiumRequired') || 'Premium Required'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('pricing.upgradeToAccess') || 'Upgrade to unlock this and all premium features'}
              </p>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-semibold rounded-lg shadow hover:shadow-md transition-all hover:scale-105"
            >
              <Gem size={13} />
              {t('pricing.upgradeToPremium') || 'Upgrade to Premium'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

/**
 * Lightweight inline badge shown on features free users can see but not use.
 * Call onClick to navigate to pricing.
 */
export const PremiumBadge = memo(function PremiumBadge({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate('/pricing');
      }}
      title={t('pricing.upgradeToAccess') || 'Upgrade to Premium'}
      className={`inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] font-bold rounded-full shadow-sm hover:shadow-md transition-all ${className ?? ''}`}
    >
      <Sparkles size={9} />
      PRO
    </button>
  );
});

export default PremiumGate;
