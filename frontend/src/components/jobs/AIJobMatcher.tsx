import React, { memo, useState, ErrorInfo, ReactNode } from 'react';
import { Brain, TrendingUp, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/store/i18nStore';
import { useResumeStore } from '@/store/resumeStore';
import { Skeleton } from '@/components/ui/skeleton';

interface JobMatch {
  jobId: string;
  matchScore: number;
  reasons: string[];
  improvements?: string[];
}

interface AIJobMatcherProps {
  jobId: string;
  jobDescription: string;
  jobRequirements: string[];
  onClose?: () => void;
}

// Error Boundary Component
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
  const { t } = useI18n();
  const { currentResume } = useResumeStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatch | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeMatch = async () => {
    setIsAnalyzing(true);
    setIsOpen(true);
    setError(null);
    
    try {
      // Simulate AI analysis (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const skills = currentResume?.skills || [];
      const experience = currentResume?.experience || [];
      
      // Simple matching algorithm (replace with AI)
      let matchScore = 0;
      const reasons: string[] = [];
      const improvements: string[] = [];
      
      // Check skills match
      const matchedSkills = jobRequirements.filter(req => 
        skills.some(skill => 
          skill.toLowerCase().includes(req.toLowerCase()) || 
          req.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      if (matchedSkills.length > 0) {
        matchScore += (matchedSkills.length / jobRequirements.length) * 50;
        reasons.push(`Bạn có ${matchedSkills.length}/${jobRequirements.length} kỹ năng phù hợp`);
      } else {
        improvements.push('Thêm các kỹ năng liên quan vào CV');
      }
      
      // Check experience
      if (experience.length > 0) {
        matchScore += 30;
        reasons.push('Bạn có kinh nghiệm làm việc phù hợp');
      } else {
        improvements.push('Thêm kinh nghiệm làm việc vào CV');
      }
      
      // Check summary
      if (currentResume?.summary && currentResume.summary.length > 50) {
        matchScore += 20;
        reasons.push('CV có summary chuyên nghiệp');
      } else {
        improvements.push('Cải thiện phần summary để nổi bật hơn');
      }
      
      setMatchResult({
        jobId,
        matchScore: Math.min(100, Math.round(matchScore)),
        reasons,
        improvements,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze job match');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    if (score >= 60) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) {
      return 'Rất phù hợp';
    }
    if (score >= 60) {
      return 'Khá phù hợp';
    }
    if (score >= 40) {
      return 'Cần cải thiện';
    }
    return 'Chưa phù hợp';
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
          <span>
            {isAnalyzing ? 'Đang phân tích...' : 'AI Match Score'}
          </span>
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
                  <span className="truncate">AI Job Match Analysis</span>
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
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              ) : isAnalyzing ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-6">
                    <Loader2 size={32} className="text-purple-500 animate-spin mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Đang phân tích CV của bạn...</p>
                  </div>
                  
                  {/* Loading Skeleton */}
                  <div className="space-y-3">
                    <Skeleton variant="rectangular" width="100%" height={120} className="rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton variant="text" width="60%" height={20} />
                      <Skeleton variant="text" width="100%" height={16} />
                      <Skeleton variant="text" width="80%" height={16} />
                    </div>
                    <div className="space-y-2">
                      <Skeleton variant="text" width="50%" height={20} />
                      <Skeleton variant="text" width="100%" height={16} />
                      <Skeleton variant="text" width="90%" height={16} />
                    </div>
                  </div>
                </div>
              ) : matchResult ? (
                <div className="space-y-4">
                  {/* Match Score */}
                  <div className={`p-4 sm:p-5 rounded-lg border-2 ${getMatchColor(matchResult.matchScore)}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <span className="text-sm sm:text-base font-semibold">Điểm phù hợp</span>
                      <span className="text-2xl sm:text-3xl font-black">{matchResult.matchScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 sm:h-3 mb-2">
                      <motion.div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 sm:h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${matchResult.matchScore}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs sm:text-sm font-medium">{getMatchLabel(matchResult.matchScore)}</p>
                  </div>

                  {/* Reasons & Improvements Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Reasons */}
                    {matchResult.reasons.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2.5 flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                          Điểm mạnh
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

                    {/* Improvements */}
                    {matchResult.improvements && matchResult.improvements.length > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2.5 flex items-center gap-2">
                          <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />
                          Gợi ý cải thiện
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
                  </div>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onClose?.();
                    }}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold text-sm sm:text-base shadow-md hover:shadow-lg"
                  >
                    Đóng
                  </button>
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
