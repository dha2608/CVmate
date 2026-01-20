import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Interview = () => {
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
          <div className="min-h-screen bg-neutral-50 p-8 flex flex-col items-center justify-center">
              <h1 className="text-3xl font-bold mb-2 text-secondary">Interview Simulator</h1>
              <p className="text-gray-600 mb-8">Choose a persona to start your practice session</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                  {[
                      { id: 'friendly-hr', title: 'Friendly HR', desc: 'Focuses on culture fit and soft skills. Gentle and encouraging.' },
                      { id: 'strict-manager', title: 'Strict Manager', desc: 'Drills into technical details and problem solving. Direct and challenging.' },
                      { id: 'english-native', title: 'English Native', desc: 'Checks your language proficiency, grammar, and fluency.' }
                  ].map(p => (
                      <div 
                        key={p.id} 
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-accent transition-all group" 
                        onClick={() => startInterview(p.id)}
                      >
                          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4 group-hover:bg-red-50">
                              <span className="text-2xl">🤖</span>
                          </div>
                          <h3 className="text-xl font-semibold mb-2 text-secondary">{p.title}</h3>
                          <p className="text-gray-600 text-sm">{p.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
            <h2 className="font-bold text-secondary capitalize">Interview: {activePersona.replace('-', ' ')}</h2>
            <Button variant="ghost" size="sm" onClick={() => setActivePersona(null)}>End Session</Button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-accent text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                    }`}>
                        {msg.content}
                    </div>
                </div>
            ))}
        </div>
        
        <div className="p-4 bg-white border-t flex gap-2 items-center">
            <Button 
                variant="outline" 
                size="icon"
                onClick={() => setIsRecording(!isRecording)} 
                className={`rounded-full ${isRecording ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : ''}`}
            >
                🎤
            </Button>
            <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Type your answer..." 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="rounded-full"
            />
            <Button onClick={handleSend} className="rounded-full bg-secondary hover:bg-secondary/90 text-white px-6">Send</Button>
        </div>
    </div>
  );
};

export default Interview;
