import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Interview = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activePersona, setActivePersona] = useState<string | null>(null);

  const startInterview = async (persona: string) => {
    setActivePersona(persona);
    // Mock initial message
    setMessages([{ role: 'assistant', content: `Hello! I'm your ${persona.replace('-', ' ')}. Shall we begin?` }]);
    
    // TODO: Connect to backend API
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs);
    setInput('');
    
    // Mock AI response
    setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: "That's a good answer. Can you give me a specific example?" }]);
    }, 1000);
  };

  if (!activePersona) {
      return (
          <div className="min-h-screen bg-neutral-50 p-8 flex flex-col items-center justify-center relative">
              <Button 
                variant="ghost" 
                className="absolute top-8 left-8 flex items-center gap-2 hover:bg-transparent hover:text-gray-900"
                onClick={() => navigate('/dashboard')}
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
                        onClick={() => startInterview(p.id)}
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
                <Button variant="ghost" size="icon" onClick={() => setActivePersona(null)}>
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                        <img src={getPersonaAvatar(activePersona)} alt="Persona" className="w-full h-full" />
                    </div>
                    <div>
                        <h2 className="font-bold text-secondary capitalize text-sm">{activePersona.replace('-', ' ')}</h2>
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                        </span>
                    </div>
                </div>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setActivePersona(null)}>End Session</Button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f0f2f5]">
            {/* 3D Avatar Placeholder / Visualizer */}
            <div className="flex justify-center mb-8">
                 <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-lg bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
                    <img src={getPersonaAvatar(activePersona)} alt="Talking Head" className="w-full h-full object-cover transform scale-110" />
                    {/* Audio visualizer effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent flex items-end justify-center gap-1 pb-4">
                        <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                 </div>
            </div>

            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[80%] md:max-w-[60%] p-4 rounded-2xl shadow-sm relative ${
                        msg.role === 'user' 
                        ? 'bg-accent text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                    }`}>
                        {msg.content}
                        <span className="text-[10px] opacity-70 absolute bottom-1 right-3">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            ))}
        </div>
        
        <div className="p-4 bg-white border-t flex gap-2 items-center">
            <Button 
                variant="outline" 
                size="icon"
                onClick={() => setIsRecording(!isRecording)} 
                className={`rounded-full h-12 w-12 flex-shrink-0 transition-all duration-300 ${
                    isRecording 
                    ? 'bg-red-50 border-red-500 text-red-600 scale-110 shadow-lg ring-4 ring-red-100' 
                    : 'hover:bg-gray-50'
                }`}
            >
                {isRecording ? (
                    <span className="animate-pulse">●</span>
                ) : (
                    <span>🎤</span>
                )}
            </Button>
            <div className="flex-1 relative">
                <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder={isRecording ? "Listening..." : "Type your answer..."}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="rounded-full pl-5 pr-12 h-12 border-gray-300 focus:border-accent focus:ring-accent"
                    disabled={isRecording}
                />
            </div>
            <Button onClick={handleSend} className="rounded-full h-12 px-6 bg-secondary hover:bg-secondary/90 shadow-md transition-transform active:scale-95" disabled={!input.trim() && !isRecording}>
                Send
            </Button>
        </div>
    </div>
  );
};

export default Interview;
