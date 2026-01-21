import { useEffect, useState, useRef } from 'react';
import { useMessageStore } from '@/store/messageStore';
import { useAuthStore } from '@/store/authStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

const Messaging = () => {
  const { user } = useAuthStore();
  const { 
    conversations, 
    activeConversation, 
    messages, 
    fetchConversations, 
    fetchMessages, 
    sendMessage, 
    setActiveConversation 
  } = useMessageStore();
  
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversation) {
        fetchMessages(activeConversation._id);
    }
  }, [activeConversation, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !activeConversation) return;
    sendMessage(activeConversation._id, inputText);
    setInputText('');
  };

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-120px)] flex overflow-hidden">
        {/* Sidebar List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 font-bold text-gray-700">Messaging</div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => (
                    <div 
                        key={conv._id}
                        className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 border-l-4 ${activeConversation?._id === conv._id ? 'border-accent bg-red-50' : 'border-transparent'}`}
                        onClick={() => setActiveConversation(conv)}
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                            {conv.avatar ? <img src={conv.avatar} className="w-full h-full object-cover"/> : conv.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{conv.name}</p>
                            <p className="text-xs text-gray-500 truncate">Last message...</p>
                        </div>
                    </div>
                ))}
                {conversations.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">No conversations yet</div>
                )}
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
            {activeConversation ? (
                <>
                    <div className="p-3 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                             {activeConversation.avatar ? <img src={activeConversation.avatar} className="w-full h-full object-cover"/> : activeConversation.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">{activeConversation.name}</h3>
                            <span className="text-xs text-green-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map(msg => (
                            <div key={msg._id} className={`flex ${msg.sender === user?._id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-lg text-sm ${
                                    msg.sender === user?._id 
                                    ? 'bg-accent text-white rounded-br-none' 
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                }`}>
                                    {msg.content}
                                    <div className={`text-[10px] mt-1 text-right ${msg.sender === user?._id ? 'text-red-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
                        <Input 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Write a message..."
                            className="flex-1"
                        />
                        <Button onClick={handleSend} size="icon" className="bg-accent hover:bg-red-700">
                            <Send size={18} />
                        </Button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare size={48} className="mb-2 opacity-20" />
                    <p>Select a conversation to start messaging</p>
                </div>
            )}
        </div>
      </div>
    </MainLayout>
  );
};

import { MessageSquare } from 'lucide-react';
export default Messaging;
