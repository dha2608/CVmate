import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/utils';
import { useToastStore } from '@/store/toastStore';

const SupportChat = () => {
  const toast = useToastStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'bot'; text: string; time: Date }>>([
    {
      type: 'bot',
      text: 'Xin chào! Tôi là trợ lý AI của CV Mate. Tôi có thể giúp gì cho bạn?',
      time: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) {
      return;
    }

    const userMessage = {
      type: 'user' as const,
      text: inputValue,
      time: new Date(),
    };

    const userMessageText = inputValue;
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get conversation history (last 10 messages)
      const conversationHistory = messages
        .slice(-10)
        .map((msg) => ({
          type: msg.type,
          text: msg.text,
        }));

      const response = await api.chatWithAI(userMessageText, conversationHistory);

      if (response.success && response.data?.message) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: response.data.message,
            time: new Date(),
          },
        ]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage = error.message || 'Xin lỗi, tôi gặp sự cố. Vui lòng thử lại sau hoặc gửi email đến support@cvmate.com.';
      
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: errorMessage,
          time: new Date(),
        },
      ]);
      
      toast.error('Không thể kết nối với AI. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages, toast]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-crimson-red hover:bg-fire-red text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover-lift glass-button ${
          isOpen ? 'rotate-180' : ''
        }`}
        aria-label="Open support chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] glass-chat flex flex-col animate-scale-in"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-crimson-red to-fire-red text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm">CV Mate AI Support</h3>
                <p className="text-xs text-red-100">{isLoading ? 'Đang suy nghĩ...' : 'Trả lời ngay lập tức'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/20"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800/50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="w-8 h-8 bg-crimson-red rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-crimson-red to-fire-red text-white shadow-md'
                      : 'glass-card bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-red-100' : 'text-gray-400 dark:text-gray-500'}`}>
                    {message.time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn của bạn..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-red dark:focus:ring-red-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="bg-crimson-red hover:bg-fire-red text-white px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Hoặc gửi email đến{' '}
              <a href="mailto:support@cvmate.com" className="text-crimson-red hover:underline">
                support@cvmate.com
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChat;
