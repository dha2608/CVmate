import { useEffect, useState, useRef } from 'react';
import { useMessageStore } from '@/store/messageStore';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare, Check, CheckCheck, Loader2 } from 'lucide-react';

const Messaging = () => {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const toast = useToastStore();
  const { 
    conversations, 
    activeConversation, 
    messages, 
    isLoading,
    isTyping,
    fetchConversations, 
    fetchMessages, 
    sendMessage, 
    setActiveConversation,
    markAsRead
  } = useMessageStore();
  
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversation) {
        fetchMessages(activeConversation._id);
        markAsRead(activeConversation._id);
    }
  }, [activeConversation, fetchMessages, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-refresh messages every 5 seconds for real-time feel
  useEffect(() => {
    if (!activeConversation) return;
    const interval = setInterval(() => {
      fetchMessages(activeConversation._id);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConversation, fetchMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeConversation || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(activeConversation._id, inputText);
      setInputText('');
    } catch (error: any) {
      toast.error(error.message || t('messaging.sendFailed'));
    } finally {
      setIsSending(false);
    }
  };

  const getLastMessage = (conv: any) => {
    // This would come from backend - for now, show placeholder
    return conv.lastMessage || t('messaging.noMessages');
  };

  const getUnreadCount = (conv: any) => {
    return conv.unreadCount || 0;
  };

  return (
    <MainLayout>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-120px)] flex flex-col sm:flex-row overflow-hidden animate-fade-in">
        {/* Sidebar List */}
        <div className="w-full sm:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-white flex items-center gap-2">
              <MessageSquare size={20} />
              {t('messaging.title')}
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => {
                  const unreadCount = getUnreadCount(conv);
                  return (
                    <div 
                        key={conv._id}
                        className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 transition-all duration-200 ${
                          activeConversation?._id === conv._id 
                            ? 'border-accent bg-red-50 dark:bg-red-900/20' 
                            : 'border-transparent'
                        }`}
                        onClick={() => setActiveConversation(conv)}
                    >
                        <div className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 overflow-hidden flex-shrink-0">
                            {conv.avatar ? (
                              <img src={conv.avatar} className="w-full h-full object-cover" alt={conv.name} loading="lazy" />
                            ) : (
                              conv.name.charAt(0).toUpperCase()
                            )}
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{conv.name}</p>
                              {unreadCount > 0 && (
                                <span className="bg-accent text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{getLastMessage(conv)}</p>
                        </div>
                    </div>
                  );
                })}
                {conversations.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {t('messaging.noConversations')}
                    </div>
                )}
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
            {activeConversation ? (
                <>
                    <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 shadow-sm">
                        <div className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 overflow-hidden flex-shrink-0">
                             {activeConversation.avatar ? (
                               <img src={activeConversation.avatar} className="w-full h-full object-cover" alt={activeConversation.name} loading="lazy" />
                             ) : (
                               activeConversation.name.charAt(0).toUpperCase()
                             )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{activeConversation.name}</h3>
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> 
                                {t('messaging.online')}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {isLoading && messages.length === 0 ? (
                          <div className="flex justify-center items-center h-full">
                            <Loader2 className="animate-spin text-accent" size={24} />
                          </div>
                        ) : (
                          <>
                            {messages.map(msg => {
                              const isOwn = msg.sender === user?._id;
                              const isRead = (msg as any).readAt;
                              return (
                                <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    <div className={`max-w-[70%] sm:max-w-[60%] p-3 rounded-lg text-sm shadow-sm ${
                                        isOwn 
                                        ? 'bg-accent text-white rounded-br-none' 
                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                    }`}>
                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                        <div className={`flex items-center gap-1 mt-1 text-[10px] ${isOwn ? 'text-red-100 justify-end' : 'text-gray-400 dark:text-gray-500'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            {isOwn && (
                                              <span className="ml-1">
                                                {isRead ? (
                                                  <CheckCheck size={12} className="text-blue-300" />
                                                ) : (
                                                  <Check size={12} />
                                                )}
                                              </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                              );
                            })}
                            {isTyping && (
                              <div className="flex justify-start animate-fade-in">
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg rounded-bl-none p-3">
                                  <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div ref={messagesEndRef} />
                          </>
                        )}
                    </div>

                    <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <Input 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                              }
                            }}
                            placeholder={t('messaging.writeMessage')}
                            className="flex-1 dark:bg-gray-700 dark:border-gray-600"
                            disabled={isSending}
                        />
                        <Button 
                          onClick={handleSend} 
                          size="icon" 
                          className="bg-accent hover:bg-red-700 flex-shrink-0"
                          disabled={isSending || !inputText.trim()}
                        >
                          {isSending ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Send size={18} />
                          )}
                        </Button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <MessageSquare size={48} className="mb-2 opacity-20" />
                    <p className="text-sm">{t('messaging.selectConversation')}</p>
                </div>
            )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Messaging;
