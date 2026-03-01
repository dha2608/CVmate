import React, { memo, useState, ErrorInfo, ReactNode } from 'react';
import { Brain, TrendingUp, CheckCircle2, AlertCircle, X, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/store/i18nStore';
import { useResumeStore } from '@/store/resumeStore';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface JobMatch {
  jobId: string;
  matchScore: number;
  reasons: string[];
  improvements?: string[];
  hasEnoughData: boolean;
}

interface AIJobMatcherProps {
  jobId: string;
  jobDescription: string;
  jobRequirements: string[];
  onClose?: () => void;
}

class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AIJobMatcher Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const AIJobMatcherComponent = ({ jobId, jobDescription, jobRequirements, onClose }: AIJobMatcherProps) => {
  const { t, language } = useI18n();
  const { currentResume } = useResumeStore();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatch | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVi = language === 'vi';

  const analyzeMatch = async () => {
    setIsAnalyzing(true);
    setIsOpen(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const skills = currentResume?.skills || [];
      const experience = currentResume?.experience || [];
      const summary = currentResume?.summary || '';
      const hasEnoughData = skills.length > 0 || experience.length > 0 || summary.length > 20;

      let matchScore = 0;
      const reasons: string[] = [];
      const improvements: string[] = [];

      const normalizedReqs = (jobRequirements || []).filter(Boolean);
      const safeReqs = normalizedReqs.length > 0 ? normalizedReqs : [jobDescription || 'general requirement'];

      const matchedSkills = safeReqs.filter((req) =>
        skills.some(
          (skill) =>
            skill.toLowerCase().includes(String(req).toLowerCase()) ||
            String(req).toLowerCase().includes(skill.toLowerCase())
        )
      );

      if (matchedSkills.length > 0) {
        matchScore += (matchedSkills.length / safeReqs.length) * 55;
        reasons.push(
          isVi
            ? `Bạn có ${matchedSkills.length}/${safeReqs.length} kỹ năng phù hợp với yêu cầu chính.`
            : `You match ${matchedSkills.length}/${safeReqs.length} key skill requirements.`
        );
      } else {
        improvements.push(
          isVi
            ? 'Thêm các kỹ năng liên quan trực tiếp đến JD vào phần Skills của CV.'
            : 'Add job-specific skills to the Skills section of your resume.'
        );
      }

      if (experience.length > 0) {
        matchScore += 30;
        reasons.push(
          isVi
            ? 'Bạn đã có kinh nghiệm làm việc, đây là điểm cộng lớn cho vị trí này.'
            : 'You already have work experience, which is a strong positive signal.'
        );
      } else {
        improvements.push(
          isVi
            ? 'Bổ sung dự án/kinh nghiệm thực tế để tăng độ tin cậy hồ sơ.'
            : 'Add project/work experience to improve credibility.'
        );
      }

      if (summary.length > 50) {
        matchScore += 15;
        reasons.push(
          isVi
            ? 'Phần Summary của bạn khá rõ ràng và có thể hiện định hướng nghề nghiệp.'
            : 'Your summary is clear and conveys career direction.'
        );
      } else {
        improvements.push(
          isVi
            ? 'Viết Summary 3-4 câu nêu rõ thế mạnh và mục tiêu ứng tuyển.'
            : 'Write a 3-4 sentence summary highlighting strengths and target role.'
        );
      }

      if (!hasEnoughData) {
        matchScore = 0;
        reasons.length = 0;
        improvements.length = 0;
        improvements.push(
          isVi
            ? 'Hồ sơ hiện chưa đủ dữ liệu để AI đánh giá chính xác. Hãy cập nhật Skills, Experience và Summary trước.'
            : 'Your resume does not yet have enough data for reliable AI matching. Add Skills, Experience, and Summary first.'
        );
      }

      setMatchResult({
        jobId,
        matchScore: Math.min(100, Math.round(matchScore)),
        reasons,
        improvements,
        hasEnoughData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze job match');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    if (score > 0) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const getMatchLabel = (score: number, hasEnoughData: boolean) => {
    if (!hasEnoughData) return isVi ? 'Chưa đủ dữ liệu đánh giá' : 'Not enough data to score';
    if (score >= 80) return isVi ? 'Rất phù hợp' : 'Strong match';
    if (score >= 60) return isVi ? 'Khá phù hợp' : 'Good match';
    if (score >= 40) return isVi ? 'Cần cải thiện' : 'Needs improvement';
    return isVi ? 'Chưa phù hợp' : 'Low match';
  };

  return (
    <ErrorBoundary>
      <div className="relative">
        <button
          onClick={analyzeMatch}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold"
        >
          <Brain size={14} className="sm:w-4 sm:h-4" />
          <span>{isAnalyzing ? (isVi ? 'Đang phân tích...' : 'Analyzing...') : 'AI Match Score'}</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 p-4 sm:p-6 w-[95vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-purple-500 flex-shrink-0" />
                    <span className="truncate">{isVi ? 'Phân tích AI Match' : 'AI Job Match Analysis'}</span>
                  </h3>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onClose?.();
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {error ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">Error</p>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                        <button
                          onClick={analyzeMatch}
                          className="mt-3 text-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          {isVi ? 'Thử lại' : 'Try Again'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : isAnalyzing ? (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 size={32} className="text-purple-500 animate-spin mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">{isVi ? 'Đang phân tích CV của bạn...' : 'Analyzing your resume...'}</p>
                    </div>

                    <div className="space-y-3">
                      <Skeleton variant="rectangular" width="100%" height={120} className="rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton variant="text" width="60%" height={20} />
                        <Skeleton variant="text" width="100%" height={16} />
                        <Skeleton variant="text" width="80%" height={16} />
                      </div>
                    </div>
                  </div>
                ) : matchResult ? (
                  <div className="space-y-4">
                    <div className={`p-4 sm:p-5 rounded-lg border-2 ${getMatchColor(matchResult.matchScore)}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <span className="text-sm sm:text-base font-semibold">{isVi ? 'Điểm phù hợp' : 'Match score'}</span>
                        <span className="text-2xl sm:text-3xl font-black">{matchResult.matchScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 sm:h-3 mb-2 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 sm:h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(2, matchResult.matchScore)}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                      <p className="text-xs sm:text-sm font-medium">{getMatchLabel(matchResult.matchScore, matchResult.hasEnoughData)}</p>
                    </div>

                    {matchResult.reasons.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2.5 flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                          {isVi ? 'Điểm mạnh' : 'Strengths'}
                        </h4>
                        <ul className="space-y-2">
                          {matchResult.reasons.map((reason, index) => (
                            <li key={index} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                              <span className="break-words">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {matchResult.improvements && matchResult.improvements.length > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2.5 flex items-center gap-2">
                          <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />
                          {isVi ? 'Gợi ý cải thiện' : 'Improvements'}
                        </h4>
                        <ul className="space-y-2">
                          {matchResult.improvements.map((improvement, index) => (
                            <li key={index} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-yellow-500 mt-0.5 flex-shrink-0">•</span>
                              <span className="break-words">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate('/builder')}
                        className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold text-sm flex items-center justify-center gap-2"
                      >
                        {isVi ? 'Cải thiện CV ngay' : 'Improve CV now'}
                        <ArrowRight size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onClose?.();
                        }}
                        className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-semibold text-sm"
                      >
                        {isVi ? 'Đóng' : 'Close'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

const AIJobMatcher = memo(AIJobMatcherComponent);

export default AIJobMatcher;
