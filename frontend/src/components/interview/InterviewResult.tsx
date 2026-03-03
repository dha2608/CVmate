import { useMemo } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import { useI18n } from '@/store/i18nStore';
import { BadgeCheck, ChartSpline, Sparkles } from 'lucide-react';

const DIMENSIONS: {
  key: 'communication' | 'content' | 'confidence' | 'structure';
  label: string;
}[] = [
  { key: 'communication', label: 'Communication' },
  { key: 'content', label: 'Content' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'structure', label: 'Structure' },
];

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const InterviewResult = () => {
  const { t } = useI18n();
  const { feedback } = useInterviewStore();

  const scores = feedback?.scoresByDimension || {};

  const radarPath = useMemo(() => {
    const centerX = 120;
    const centerY = 120;
    const maxRadius = 90;

    const points = DIMENSIONS.map((dim, index) => {
      const raw = scores[dim.key] ?? 0;
      const value = Math.max(0, Math.min(100, raw));
      const radius = (value / 100) * maxRadius;
      const angle = (360 / DIMENSIONS.length) * index;
      return polarToCartesian(centerX, centerY, radius, angle);
    });

    if (!points.length) {
      return '';
    }

    return (
      points
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(' ') + ' Z'
    );
  }, [scores]);

  if (!feedback) {
    return null;
  }

  const overall = feedback.overallScore ?? feedback.confidenceScore ?? feedback.contentScore ?? 0;

  return (
    <section className="mt-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-crimson-red to-fire-red flex items-center justify-center">
            <ChartSpline className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              {t('interview.resultTitle') || 'Interview Result'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('interview.resultSubtitle') || 'Overall performance and detailed breakdown'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('interview.overallScore') || 'Overall score'}
          </span>
          <div className="px-3 py-1 rounded-full bg-crimson-red/10 text-crimson-red dark:bg-red-500/15 dark:text-red-300 text-sm font-semibold">
            {Math.round(overall)} / 100
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
        {/* Radar chart */}
        <div className="lg:col-span-1 flex justify-center">
          <div className="relative w-60 h-60">
            <svg viewBox="0 0 240 240" className="w-full h-full text-gray-200 dark:text-gray-700">
              {/* grid rings */}
              {[0.25, 0.5, 0.75, 1].map((ratio) => (
                <circle
                  key={ratio}
                  cx="120"
                  cy="120"
                  r={90 * ratio}
                  className="fill-none stroke-current"
                  strokeWidth={ratio === 1 ? 1.4 : 0.8}
                  strokeDasharray={ratio === 1 ? undefined : '4 4'}
                  opacity={ratio === 1 ? 0.8 : 0.5}
                />
              ))}
              {/* axes */}
              {DIMENSIONS.map((_, index) => {
                const end = polarToCartesian(120, 120, 90, (360 / DIMENSIONS.length) * index);
                return (
                  <line
                    key={index}
                    x1="120"
                    y1="120"
                    x2={end.x}
                    y2={end.y}
                    className="stroke-current"
                    strokeWidth={0.8}
                    opacity={0.4}
                  />
                );
              })}
              {/* data polygon */}
              {radarPath && (
                <path
                  d={radarPath}
                  className="fill-crimson-red/20 stroke-crimson-red dark:fill-red-500/20 dark:stroke-red-400"
                  strokeWidth={2}
                />
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center max-w-[120px]">
                {t('interview.radarHint') || 'Higher area means stronger overall performance'}
              </span>
            </div>
          </div>
        </div>

        {/* Dimension breakdown */}
        <div className="space-y-3 lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {DIMENSIONS.map((dim) => {
              const value = scores[dim.key] ?? null;
              return (
                <div
                  key={dim.key}
                  className="bg-white/70 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-700/80 rounded-xl p-2.5 sm:p-3"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{dim.label}</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {value != null ? `${Math.round(value)} / 100` : '—'}
                  </p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-crimson-red to-fire-red dark:from-red-400 dark:to-red-500 transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strengths & improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-gray-900/70 border border-emerald-200/70 dark:border-emerald-700/70 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <BadgeCheck className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                  {t('interview.strengths') || 'Strengths'}
                </h4>
              </div>
              <ul className="space-y-1.5">
                {(feedback.strengths && feedback.strengths.length
                  ? feedback.strengths
                  : [t('interview.noStrengths') || 'No strengths identified yet.'])!.map(
                  (item, idx) => (
                    <li
                      key={idx}
                      className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-100"
                    >
                      • {item}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-900/70 border border-amber-200/70 dark:border-amber-700/70 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {t('interview.improvements') || 'What to improve'}
                </h4>
              </div>
              <ul className="space-y-1.5">
                {(feedback.improvements && feedback.improvements.length
                  ? feedback.improvements
                  : [
                      t('interview.noImprovements') || 'No improvement suggestions available.',
                    ])!.map((item, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-amber-900 dark:text-amber-100">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Summary & per-question feedback */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {feedback.suggestions && (
          <div className="lg:col-span-1 bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {t('interview.detailedSummary') || 'Detailed summary'}
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {feedback.suggestions}
            </p>
          </div>
        )}
        {feedback.perQuestionFeedback && feedback.perQuestionFeedback.length > 0 && (
          <div className="lg:col-span-2 bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {t('interview.perQuestionFeedback') || 'Per-question feedback'}
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {feedback.perQuestionFeedback.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Q{idx + 1}: {item.question}
                    </p>
                    <span className="px-2 py-0.5 rounded-full bg-gray-900 text-white text-xs">
                      {Math.round(item.score)} / 100
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    {t('interview.yourAnswer') || 'Your answer'}: {item.answer}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{item.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default InterviewResult;
