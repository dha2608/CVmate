import { useState } from 'react';
import { Brain, Lightbulb, X, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/store/i18nStore';

interface Suggestion {
  id: string;
  type: 'improvement' | 'addition' | 'optimization';
  title: string;
  description: string;
  action?: string;
}

interface AISuggestionsProps {
  onApply?: (suggestion: Suggestion) => void;
}

const AISuggestions = ({ onApply }: AISuggestionsProps) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions] = useState<Suggestion[]>([
    {
      id: '1',
      type: 'improvement',
      title: 'Enhance Summary',
      description: 'Your summary could be more impactful. Add quantifiable achievements.',
      action: 'Enhance with AI'
    },
    {
      id: '2',
      type: 'addition',
      title: 'Add Skills Section',
      description: 'Consider adding technical skills to highlight your expertise.',
      action: 'Add Section'
    },
    {
      id: '3',
      type: 'optimization',
      title: 'Optimize Keywords',
      description: 'Add more ATS-friendly keywords to increase visibility.',
      action: 'Optimize'
    },
  ]);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const handleApply = (suggestion: Suggestion) => {
    setApplied(new Set([...applied, suggestion.id]));
    onApply?.(suggestion);
  };

  const unreadCount = suggestions.filter(s => !applied.has(s.id)).length;

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 lg:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl flex-shrink-0 whitespace-nowrap"
      >
        <Brain size={14} className="sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm font-semibold hidden md:inline">AI Suggestions</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[45]" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-full right-0 mt-2 w-80 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-[50] p-4 max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Lightbulb size={18} className="text-yellow-500" />
                  AI Suggestions
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {suggestions.map((suggestion) => {
                    const isApplied = applied.has(suggestion.id);
                    return (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isApplied
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 mb-1">
                              {suggestion.title}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {suggestion.description}
                            </p>
                          </div>
                          {isApplied && (
                            <Check size={16} className="text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        {!isApplied && suggestion.action && (
                          <button
                            onClick={() => handleApply(suggestion)}
                            className="w-full mt-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                          >
                            {suggestion.action}
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AISuggestions;
