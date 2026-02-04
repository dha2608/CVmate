import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'bot'; text: string; time: Date }>>([
    {
      type: 'bot',
      text: 'Xin chào! Tôi là trợ lý AI của CV Mate. Tôi có thể giúp gì cho bạn?',
      time: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) {
      return;
    }

    const userMessage = {
      type: 'user' as const,
      text: inputValue,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        'Cảm ơn bạn đã liên hệ! Đội ngũ hỗ trợ của chúng tôi sẽ phản hồi trong vòng 24 giờ. Bạn có thể gửi email đến support@cvmate.com để được hỗ trợ nhanh hơn.',
        'Tôi hiểu câu hỏi của bạn. Để được hỗ trợ chi tiết hơn, vui lòng truy cập Help Center hoặc liên hệ trực tiếp qua email support@cvmate.com.',
        'Bạn có thể tìm câu trả lời trong phần FAQ hoặc xem hướng dẫn sử dụng tại Help Center. Nếu cần hỗ trợ thêm, hãy gửi email cho chúng tôi.',
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: randomResponse,
          time: new Date(),
        },
      ]);
    }, 1000);
  };

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
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-crimson-red hover:bg-fire-red text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover-lift ${
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
          className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col animate-scale-in"
        >
          {/* Header */}
          <div className="bg-crimson-red text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <h3 className="font-bold">CV Mate Support</h3>
                <p className="text-xs text-red-100">Chúng tôi thường phản hồi trong vài phút</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                      ? 'bg-crimson-red text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-red-100' : 'text-gray-400'}`}>
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
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-red text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-crimson-red hover:bg-fire-red text-white px-4"
              >
                <Send size={18} />
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
