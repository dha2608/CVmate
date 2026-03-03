import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Lightbulb,
  RotateCcw,
  Timer,
  Volume2,
  VolumeX,
  History,
  ChevronRight,
  Medal,
} from 'lucide-react';
import { useInterviewStore } from '@/store/interviewStore';
import InterviewDashboard from '@/components/interview/InterviewDashboard';
import PersonaSelector from '@/components/interview/PersonaSelector';
import InterviewAnalytics from '@/components/interview/InterviewAnalytics';
import InterviewResult from '@/components/interview/InterviewResult';
import AIFeatureNotice from '@/components/AIFeatureNotice';
import MainLayout from '@/components/layout/MainLayout';
import { trackEvent } from '@/lib/analytics';

// Type definitions for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

const Interview = () => {
  const { t, language } = useI18n();
  const toast = useToastStore();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [interviewMode, setInterviewMode] = useState<'practice' | 'stress' | 'normal'>('normal');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [avatarOk, setAvatarOk] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const {
    persona,
    messages,
    feedback,
    status,
    isStarting,
    isSending,
    isEnding,
    error,
    startSession,
    sendUserMessage,
    endSession,
    reset,
    interviews,
    isLoadingHistory,
    fetchInterviews,
    loadInterview,
  } = useInterviewStore();

  useEffect(() => {
    setAvatarOk(true);
  }, [persona]);

  // Fetch interview history on mount
  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleLoadInterview = useCallback(
    async (id: string) => {
      await loadInterview(id);
    },
    [loadInterview]
  );

  // Show toast when error occurs with better handling
  const prevErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      prevErrorRef.current = error;
      // Check for specific error types
      let errorMessage = error;
      const errorLower = error.toLowerCase();

      if (
        errorLower.includes('rate limit') ||
        errorLower.includes('rate limit exceeded') ||
        errorLower.includes('429')
      ) {
        errorMessage =
          t('interview.rateLimitExceeded') ||
          'API rate limit exceeded. Please wait a moment and try again.';
      } else if (
        error.includes('503') ||
        errorLower.includes('service temporarily unavailable') ||
        errorLower.includes('service unavailable')
      ) {
        errorMessage =
          t('interview.serviceUnavailable') ||
          'Service temporarily unavailable. Please try again in a few moments.';
      } else if (errorLower.includes('unauthorized') || errorLower.includes('401')) {
        errorMessage = 'Session expired. Please login again.';
      } else if (errorLower.includes('network') || errorLower.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      toast.error(errorMessage);
    }
  }, [error, toast, t]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'vi' ? 'vi-VN' : 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const firstResult = event.results[0];
        if (firstResult && firstResult[0]) {
          const transcript = firstResult[0].transcript;
          setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        }
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          toast.error(
            t('interview.microphoneDenied') ||
              'Microphone permission denied. Please enable microphone access in your browser settings.'
          );
        } else if (event.error === 'no-speech') {
          // Silent error - user didn't speak
        } else if (event.error === 'aborted') {
          // Silent error - recognition was stopped
        } else {
          toast.error(t('interview.speechError') || 'Speech recognition error. Please try again.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    };
  }, [toast, t]);

  const handleStartInterview = async (personaId: string) => {
    await startSession(personaId as any);
    // Only start timer if session actually started (API succeeded)
    const { persona: currentPersona, status: currentStatus } = useInterviewStore.getState();
    if (currentPersona && currentStatus === 'active') {
      setTimeElapsed(0);
      trackEvent('interview_started', { persona: personaId });
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || status === 'completed') {
      return;
    }
    const text = input;
    setInput('');
    await sendUserMessage(text);
    trackEvent('interview_message_sent', {
      length: text.length,
      persona,
    });
  };

  const handleEnd = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    await endSession();
    trackEvent('interview_ended', {
      persona,
      durationSeconds: timeElapsed,
      messageCount: messages.length,
    });
  };

  const handleBackToDashboard = () => {
    reset();
    navigate('/dashboard');
  };

  const handleStartNew = () => {
    reset();
  };

  const personaTitle = useMemo(() => {
    return persona === 'friendly-hr'
      ? t('interview.friendlyHR')
      : persona === 'strict-manager'
        ? t('interview.strictManager')
        : persona === 'tech-lead'
          ? t('interview.techLead')
          : persona === 'startup-founder'
            ? t('interview.startupFounder')
            : persona === 'executive'
              ? t('interview.executive')
              : persona === 'academic'
                ? t('interview.academic')
                : t('interview.englishNative');
  }, [persona, t]);

  if (!persona) {
    return (
      <MainLayout layoutMode="narrow" showRightSidebar={false} key="interview-selector">
        <div className="py-4 sm:py-6 lg:py-8">
          <div className="mb-6 sm:mb-8">
            <Button
              variant="ghost"
              className="mb-4 text-sm sm:text-base"
              onClick={handleBackToDashboard}
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5 mr-2" />{' '}
              {t('interview.backToDashboard')}
            </Button>

            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 sm:mb-3 bg-gradient-to-r from-crimson-red to-fire-red bg-clip-text text-transparent px-2">
                AI Interview Simulator
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-4">
                Practice with AI-powered interviewers. Get real-time feedback and improve your
                skills.
              </p>

              {/* Interview Modes */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-6 sm:mb-8 px-2">
                <Button
                  variant={interviewMode === 'practice' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInterviewMode('practice')}
                  className={`text-xs sm:text-sm ${interviewMode === 'practice' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                >
                  <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Practice Mode
                </Button>
                <Button
                  variant={interviewMode === 'stress' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInterviewMode('stress')}
                  className={`text-xs sm:text-sm ${interviewMode === 'stress' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                >
                  <Timer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Stress Test
                </Button>
                <Button
                  variant={interviewMode === 'normal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInterviewMode('normal')}
                  className={`text-xs sm:text-sm ${interviewMode === 'normal' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                >
                  Normal Mode
                </Button>
              </div>
            </div>
          </div>

          <PersonaSelector onSelect={handleStartInterview} isLoading={isStarting} />

          {/* Interview History */}
          {(interviews.length > 0 || isLoadingHistory) && (
            <div className="mt-8 sm:mt-10">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {t('interview.history') || 'Interview History'}
                </h2>
              </div>

              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {interviews.slice(0, 10).map((item) => {
                    const personaLabel =
                      item.persona === 'friendly-hr'
                        ? t('interview.friendlyHR')
                        : item.persona === 'strict-manager'
                          ? t('interview.strictManager')
                          : item.persona === 'tech-lead'
                            ? t('interview.techLead')
                            : item.persona === 'startup-founder'
                              ? t('interview.startupFounder')
                              : item.persona === 'executive'
                                ? t('interview.executive')
                                : item.persona === 'academic'
                                  ? t('interview.academic')
                                  : t('interview.englishNative');

                    const score =
                      item.feedback?.overallScore ?? item.feedback?.confidenceScore ?? null;
                    const isCompleted = item.status === 'completed';
                    const date = new Date(item.createdAt);
                    const timeAgo = (() => {
                      const diff = Date.now() - date.getTime();
                      const mins = Math.floor(diff / 60000);
                      const hours = Math.floor(diff / 3600000);
                      const days = Math.floor(diff / 86400000);
                      if (days > 0) return `${days}d ago`;
                      if (hours > 0) return `${hours}h ago`;
                      return `${mins}m ago`;
                    })();

                    return (
                      <button
                        key={item._id}
                        onClick={() => handleLoadInterview(item._id)}
                        className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all text-left group"
                      >
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted && score != null && score >= 70
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : isCompleted
                                ? 'bg-amber-100 dark:bg-amber-900/30'
                                : 'bg-gray-100 dark:bg-gray-800'
                          }`}
                        >
                          {isCompleted && score != null ? (
                            <Medal
                              className={`w-5 h-5 ${score >= 70 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}
                            />
                          ) : (
                            <Timer className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {personaLabel}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {timeAgo} ·{' '}
                            {isCompleted
                              ? t('interview.completed') || 'Completed'
                              : t('interview.inProgress') || 'In Progress'}
                          </p>
                        </div>

                        {score != null && (
                          <div
                            className={`text-sm font-bold px-2.5 py-1 rounded-full ${
                              score >= 70
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : score >= 40
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {Math.round(score)}%
                          </div>
                        )}

                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  const getPersonaAvatar = (id: string) => {
    const avatars: Record<string, string> = {
      'friendly-hr':
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Annie&clothing=blazerAndShirt&eyes=happy',
      'strict-manager':
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&clothing=collarAndSweater&eyebrows=angry&mouth=serious',
      'english-native':
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&clothing=shirtCrewNeck&accessories=glasses',
      'tech-lead':
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech&clothing=shirtCrewNeck&accessories=glasses&hair=short',
      'startup-founder':
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Startup&clothing=hoodie&hair=short',
      executive:
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Executive&clothing=blazerAndShirt&hair=short',
      academic:
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Academic&clothing=shirtCrewNeck&accessories=glasses',
    };
    return avatars[id] || avatars['friendly-hr'];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if error is related to AI configuration
  const isAIConfigError =
    error &&
    (error.toLowerCase().includes('api key') ||
      error.toLowerCase().includes('not configured') ||
      error.includes('503') ||
      error.toLowerCase().includes('service temporarily unavailable'));

  return (
    <div
      key="interview-session"
      className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      {isAIConfigError && (
        <div className="px-4 pt-4">
          <AIFeatureNotice feature="AI Interview Practice" />
        </div>
      )}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b dark:border-gray-700 p-2 sm:p-3 lg:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 z-10">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToDashboard}
            className="dark:hover:bg-gray-700 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-crimson-red to-fire-red p-0.5 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                {avatarOk ? (
                  <img
                    src={getPersonaAvatar(persona)}
                    alt={personaTitle}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarOk(false)}
                  />
                ) : (
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 px-2 text-center">
                    {personaTitle}
                  </span>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-secondary dark:text-red-400 capitalize text-xs sm:text-sm lg:text-base truncate">
                {personaTitle}
              </h2>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {status === 'completed' ? t('interview.completed') : t('interview.online')}
                </span>
                {interviewMode === 'stress' && (
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Timer className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {formatTime(timeElapsed)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          {interviewMode === 'practice' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHints(!showHints)}
              className="text-green-600 border-green-600 hover:bg-green-50 text-xs sm:text-sm"
            >
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{showHints ? 'Hide' : 'Show'} Hints</span>
              <span className="sm:hidden">{showHints ? 'Hide' : 'Show'}</span>
            </Button>
          )}
          {status === 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartNew}
              className="text-xs sm:text-sm"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {t('interview.startNew') || 'Start new'}
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEnd}
            disabled={isEnding || status === 'completed'}
            className="text-xs sm:text-sm"
          >
            {isEnding
              ? t('interview.ending')
              : status === 'completed'
                ? t('interview.ended')
                : t('interview.endSession')}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Real-time Dashboard */}
        {status === 'active' && <InterviewDashboard />}

        {/* Avatar (only while active, reduced size) */}
        {status === 'active' && (
          <div className="flex justify-center mb-2 sm:mb-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-2 border-white dark:border-gray-800 shadow-xl bg-gradient-to-br from-crimson-red to-fire-red flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10"></div>
              {avatarOk ? (
                <img
                  src={getPersonaAvatar(persona)}
                  alt={personaTitle}
                  className="w-full h-full object-cover relative z-10"
                  onError={() => setAvatarOk(false)}
                />
              ) : (
                <div className="w-full h-full bg-white dark:bg-gray-800 flex items-center justify-center px-2 relative z-10">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center">
                    {personaTitle}
                  </span>
                </div>
              )}
              {isRecording && (
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent flex items-end justify-center gap-1 pb-3 z-20">
                  {[...Array(5)].map((_, i) => {
                    const heights = [16, 20, 24, 20, 16];
                    return (
                      <div
                        key={i}
                        className="w-1 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s`, height: `${heights[i]}px` }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Practice Mode Hints */}
        {showHints && interviewMode === 'practice' && messages.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-300 mb-1">💡 Hint</h4>
                <p className="text-sm text-green-800 dark:text-green-400">
                  {messages[messages.length - 1]?.role === 'assistant'
                    ? 'Think about the STAR method (Situation, Task, Action, Result) when answering behavioral questions.'
                    : 'Take your time to formulate a clear, structured answer.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {messages
          .filter((msg) => msg.role !== 'system')
          .map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300 px-1 sm:px-2`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl shadow-sm relative ${
                  msg.role === 'user'
                    ? 'bg-accent text-white rounded-tr-none dark:bg-red-600'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                }`}
              >
                <p className="text-xs sm:text-sm lg:text-base break-words">{msg.content}</p>
                <span className="text-[10px] sm:text-xs opacity-70 absolute bottom-1 right-2 sm:right-3">
                  {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

        <div ref={messagesEndRef} />

        {/* Review should only appear after interview ends */}
        {status === 'completed' && feedback && <InterviewResult />}

        {/* Interview Analytics (simple overview, no mock data) */}
        {status === 'completed' && feedback && <InterviewAnalytics />}
      </div>

      {status !== 'completed' && (
        <div className="p-2 sm:p-3 lg:p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2 sm:gap-3 items-center shadow-lg">
          <Button
            variant="outline"
            size="icon"
            onClick={async () => {
              if (!recognitionRef.current) {
                toast.error(
                  t('interview.speechNotSupported') ||
                    'Speech recognition is not supported in your browser.'
                );
                return;
              }

              if (isRecording) {
                try {
                  recognitionRef.current.stop();
                  setIsRecording(false);
                } catch (e) {
                  setIsRecording(false);
                }
              } else {
                // Request microphone permission first
                try {
                  await navigator.mediaDevices.getUserMedia({ audio: true });
                  recognitionRef.current.start();
                  setIsRecording(true);
                } catch (err: any) {
                  console.error('Microphone permission error:', err);
                  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    toast.error(
                      t('interview.microphoneDenied') ||
                        'Microphone permission denied. Please enable microphone access in your browser settings and try again.'
                    );
                  } else {
                    toast.error(
                      t('interview.microphoneError') ||
                        'Could not access microphone. Please check your browser settings.'
                    );
                  }
                }
              }
            }}
            disabled={!recognitionRef.current}
            className={`rounded-full h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 flex-shrink-0 transition-all duration-300 ${
              isRecording
                ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-600 text-white scale-110 shadow-xl ring-2 sm:ring-4 ring-red-200 dark:ring-red-900/50'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
            }`}
            aria-label={isRecording ? 'Stop Recording' : 'Start Voice Input'}
          >
            {isRecording ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            )}
          </Button>
          <div className="flex-1 relative min-w-0">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRecording ? t('interview.listening') : t('interview.typeAnswer')}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="rounded-full pl-3 sm:pl-4 lg:pl-5 pr-10 sm:pr-12 h-10 sm:h-12 text-sm sm:text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-accent dark:focus:border-red-500 focus:ring-accent dark:focus:ring-red-500"
              disabled={isRecording || isSending}
            />
          </div>
          <Button
            onClick={handleSend}
            className="rounded-full h-10 sm:h-12 px-3 sm:px-4 lg:px-6 bg-secondary dark:bg-red-600 hover:bg-secondary/90 dark:hover:bg-red-700 shadow-md transition-transform active:scale-95 text-white text-xs sm:text-sm lg:text-base flex-shrink-0"
            disabled={(!input.trim() && !isRecording) || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                <span className="hidden sm:inline">{t('interview.sending')}</span>
              </>
            ) : (
              <span className="hidden sm:inline">{t('interview.send')}</span>
            )}
            {!isSending && <span className="sm:hidden">Send</span>}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Interview;
