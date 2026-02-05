import { memo, useState } from 'react';
import { Brain, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/store/i18nStore';
import { useResumeStore } from '@/store/resumeStore';

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

const AIJobMatcherComponent = ({ jobId, jobDescription, jobRequirements, onClose }: AIJobMatcherProps) => {
  const { t } = useI18n();
  const { currentResume } = useResumeStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatch | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const analyzeMatch = async () => {
    setIsAnalyzing(true);
    setIsOpen(true);
    
    // Simulate AI analysis (replace with actual API call)
    setTimeout(() => {
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
      setIsAnalyzing(false);
    }, 2000);
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
    <div className="relative">
      <button
        onClick={analyzeMatch}
        disabled={isAnalyzing}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Brain size={16} />
        <span className="text-sm font-semibold">
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
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={20} className="text-purple-500" />
                  AI Job Match Analysis
                </h3>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onClose?.();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Đang phân tích CV của bạn...</p>
                </div>
              ) : matchResult ? (
                <div className="space-y-4">
                  {/* Match Score */}
                  <div className={`p-4 rounded-lg border-2 ${getMatchColor(matchResult.matchScore)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Điểm phù hợp</span>
                      <span className="text-2xl font-black">{matchResult.matchScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                      <motion.div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${matchResult.matchScore}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-sm font-medium">{getMatchLabel(matchResult.matchScore)}</p>
                  </div>

                  {/* Reasons */}
                  {matchResult.reasons.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        Điểm mạnh
                      </h4>
                      <ul className="space-y-2">
                        {matchResult.reasons.map((reason, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {matchResult.improvements && matchResult.improvements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <AlertCircle size={16} className="text-yellow-500" />
                        Gợi ý cải thiện
                      </h4>
                      <ul className="space-y-2">
                        {matchResult.improvements.map((improvement, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-yellow-500 mt-1">•</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onClose?.();
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold"
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
  );
};

const AIJobMatcher = memo(AIJobMatcherComponent);

export default AIJobMatcher;
