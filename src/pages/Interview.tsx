import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useInterviewStore } from '@/store/interviewStore';

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
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
  } = useInterviewStore();

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
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          alert('Microphone permission denied. Please enable it in your browser settings.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleStartInterview = async (personaId: 'friendly-hr' | 'strict-manager' | 'english-native') => {
    await startSession(personaId);
  };

  const handleSend = async () => {
    if (!input.trim() || status === 'completed') return;
    const text = input;
    setInput('');
    await sendUserMessage(text);
  };

  const handleEnd = async () => {
    await endSession();
  };

  const handleBackToDashboard = () => {
    reset();
    navigate('/dashboard');
  };

  if (!persona) {
      return (
          <div className="min-h-screen bg-neutral-50 p-8 flex flex-col items-center justify-center relative">
              <Button 
                variant="ghost" 
                className="absolute top-8 left-8 flex items-center gap-2 hover:bg-transparent hover:text-gray-900"
                onClick={handleBackToDashboard}
              >
                 <ArrowLeft size={20} /> Back to Dashboard
              </Button>

              <h1 className="text-3xl font-bold mb-2 text-secondary">Interview Simulator</h1>
              <p className="text-gray-600 mb-8">Choose a persona to start your practice session</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                  {[
                      { id: 'friendly-hr', title: 'Friendly HR', desc: 'Focuses on culture fit and soft skills. Gentle and encouraging.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Annie&clothing=blazerAndShirt&eyes=happy' },
                      { id: 'strict-manager', title: 'Strict Manager', desc: 'Drills into technical details and problem solving. Direct and challenging.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&clothing=collarAndSweater&eyebrows=angry&mouth=serious' },
                      { id: 'english-native', title: 'English Native', desc: 'Checks your language proficiency, grammar, and fluency.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&clothing=shirtCrewNeck&accessories=glasses' }
                  ].map(p => (
                      <div 
                        key={p.id} 
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-accent transition-all group relative overflow-hidden" 
                        onClick={() => handleStartInterview(p.id as any)}
                      >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                          
                          <div className="w-20 h-20 rounded-full bg-neutral-100 mb-4 border-2 border-white shadow-sm overflow-hidden mx-auto">
                              <img src={p.avatar} alt={p.title} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="text-center">
                              <h3 className="text-xl font-semibold mb-2 text-secondary">{p.title}</h3>
                              <p className="text-gray-600 text-sm mb-4">{p.desc}</p>
                              <Button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-accent hover:text-white group-hover:border-accent transition-colors">
                                Start Interview
                              </Button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  const getPersonaAvatar = (id: string) => {
     if (id === 'friendly-hr') return 'https://api.dicebear.com/7.x/avataaars/svg?seed=Annie&clothing=blazerAndShirt&eyes=happy';
     if (id === 'strict-manager') return 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&clothing=collarAndSweater&eyebrows=angry&mouth=serious';
     return 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&clothing=shirtCrewNeck&accessories=glasses';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b p-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleBackToDashboard}>
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                        <img src={getPersonaAvatar(persona)} alt="Persona" className="w-full h-full" />
                    </div>
                    <div>
                        <h2 className="font-bold text-secondary capitalize text-sm">{persona.replace('-', ' ')}</h2>
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> {status === 'completed' ? 'Completed' : 'Online'}
                        </span>
                    </div>
                </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleEnd}
              disabled={isEnding || status === 'completed'}
            >
              {isEnding ? 'Ending...' : status === 'completed' ? 'Ended' : 'End Session'}
            </Button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f0f2f5]">
            {/* 3D Avatar Placeholder / Visualizer */}
            <div className="flex justify-center mb-8">
                 <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-lg bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
                    <img src={getPersonaAvatar(persona)} alt="Talking Head" className="w-full h-full object-cover transform scale-110" />
                    {/* Audio visualizer effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent flex items-end justify-center gap-1 pb-4">
                        <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                 </div>
            </div>

            {messages
              .filter((msg) => msg.role !== 'system')
              .map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[80%] md:max-w-[60%] p-4 rounded-2xl shadow-sm relative ${
                    msg.role === 'user' 
                      ? 'bg-accent text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                  }`}>
                    {msg.content}
                    <span className="text-[10px] opacity-70 absolute bottom-1 right-3">
                      {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

            <div ref={messagesEndRef} />

            {feedback && (
              <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">AI Feedback Summary</h3>
                <p className="text-xs text-gray-700 whitespace-pre-wrap">{feedback.suggestions}</p>
              </div>
            )}
        </div>
        
        <div className="p-4 bg-white border-t flex gap-2 items-center">
            <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  if (!recognitionRef.current) {
                    alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
                    return;
                  }
                  
                  if (isRecording) {
                    recognitionRef.current.stop();
                    setIsRecording(false);
                  } else {
                    recognitionRef.current.start();
                    setIsRecording(true);
                  }
                }} 
                disabled={!recognitionRef.current || status === 'completed'}
                className={`rounded-full h-12 w-12 flex-shrink-0 transition-all duration-300 ${
                    isRecording 
                    ? 'bg-red-50 border-red-500 text-red-600 scale-110 shadow-lg ring-4 ring-red-100' 
                    : 'hover:bg-gray-50'
                }`}
            >
                {isRecording ? (
                    <span className="animate-pulse text-2xl">●</span>
                ) : (
                    <span className="text-xl">🎤</span>
                )}
            </Button>
            <div className="flex-1 relative">
                <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder={isRecording ? "Listening..." : "Type your answer..."}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="rounded-full pl-5 pr-12 h-12 border-gray-300 focus:border-accent focus:ring-accent"
                    disabled={isRecording || isSending || status === 'completed'}
                />
            </div>
            <Button 
              onClick={handleSend} 
              className="rounded-full h-12 px-6 bg-secondary hover:bg-secondary/90 shadow-md transition-transform active:scale-95" 
              disabled={(!input.trim() && !isRecording) || isSending || status === 'completed'}
            >
                {isSending ? 'Sending...' : 'Send'}
            </Button>
        </div>
    </div>
  );
};

export default Interview;
