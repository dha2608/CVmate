import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMessageStore } from '@/store/messageStore';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SendHorizontal,
  MessageCircleMore,
  Check,
  CheckCheck,
  Loader2,
  ArrowLeft,
  SmilePlus,
  ImagePlus,
  X,
} from 'lucide-react';
import { apiRequest } from '@/lib/utils';
import { EmojiPicker } from '@/components/messaging/EmojiPicker';

const Messaging = () => {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const toast = useToastStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversations = useMessageStore((state) => state.conversations);
  const activeConversation = useMessageStore((state) => state.activeConversation);
  const messages = useMessageStore((state) => state.messages);
  const isLoading = useMessageStore((state) => state.isLoading);
  const isTyping = useMessageStore((state) => state.isTyping);
  const fetchConversations = useMessageStore((state) => state.fetchConversations);
  const fetchMessages = useMessageStore((state) => state.fetchMessages);
  const sendMessage = useMessageStore((state) => state.sendMessage);
  const setActiveConversation = useMessageStore((state) => state.setActiveConversation);
  const markAsRead = useMessageStore((state) => state.markAsRead);
  const connectRealtime = useMessageStore((state) => state.connectRealtime);
  const disconnectRealtime = useMessageStore((state) => state.disconnectRealtime);
  const sendTyping = useMessageStore((state) => state.sendTyping);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversations();
    connectRealtime();
    return () => {
      disconnectRealtime();
    };
  }, [fetchConversations, connectRealtime, disconnectRealtime]);

  // Handle user query param to auto-select conversation
  useEffect(() => {
    const userIdParam = searchParams.get('user');
    if (userIdParam && conversations.length > 0) {
      const foundConv = conversations.find((c) => c._id === userIdParam);
      if (foundConv) {
        setActiveConversation(foundConv);
        setSearchParams({}, { replace: true }); // Clear query param
      } else {
        // User not in conversations yet - fetch user info and create conversation
        const loadUserAndCreateConv = async () => {
          try {
            const res = await apiRequest<{ success: boolean; data: any }>(
              `/auth/users/${userIdParam}/public`,
              {
                method: 'GET',
                requiresAuth: true,
              }
            );
            if (res.success && res.data) {
              setActiveConversation({
                _id: res.data._id,
                name: res.data.name,
                avatar: res.data.avatar,
              });
              setSearchParams({}, { replace: true }); // Clear query param
            }
          } catch (error) {
            console.error('Failed to load user:', error);
          }
        };
        loadUserAndCreateConv();
      }
    }
  }, [searchParams, conversations, setActiveConversation, setSearchParams]);

  const activeConversationId = activeConversation?._id;

  useEffect(() => {
    if (!activeConversationId) return;
    fetchMessages(activeConversationId);
    markAsRead(activeConversationId);
  }, [activeConversationId, fetchMessages, markAsRead]);

  // Auto-scroll only when user is near the bottom (within 150px)
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Real-time updates handled by SSE via connectRealtime() — no polling needed

  const handleSend = async () => {
    if ((!inputText.trim() && !pendingImage) || !activeConversation || isSending) {
      return;
    }
    setIsSending(true);
    try {
      await sendMessage(activeConversation._id, inputText, pendingImage || undefined);
      setInputText('');
      setPendingImage(null);
      setShowEmojiPicker(false);
    } catch (error: any) {
      toast.error(error.message || t('messaging.sendFailed'));
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiSelect = useCallback((emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  }, []);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('messaging.imageTooLarge') || 'Image must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('messaging.imageOnly') || 'Only image files are allowed');
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await apiRequest<{ success: boolean; url: string }>('/upload/post-image', {
          method: 'POST',
          body: formData,
          requiresAuth: true,
        });
        if (res.url) {
          setPendingImage(res.url);
        }
      } catch (error: any) {
        toast.error(error.message || t('messaging.uploadFailed') || 'Failed to upload image');
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [toast]
  );

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
        <div
          className={`w-full sm:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 ${!showMobileSidebar && activeConversation ? 'hidden sm:flex' : 'flex'}`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-white flex items-center gap-2">
            <MessageCircleMore size={20} />
            {t('messaging.title')}
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading && conversations.length === 0 ? (
              <div className="space-y-0">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="p-3 flex items-center gap-3 border-l-4 border-transparent animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              conversations.map((conv) => {
                const unreadCount = getUnreadCount(conv);
                return (
                  <div
                    key={conv._id}
                    className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 transition-all duration-200 ${
                      activeConversation?._id === conv._id
                        ? 'border-accent bg-red-50 dark:bg-red-900/20'
                        : 'border-transparent'
                    }`}
                    onClick={() => {
                      setActiveConversation(conv);
                      setShowMobileSidebar(false);
                    }}
                  >
                    <div className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 overflow-hidden flex-shrink-0">
                      {conv.avatar ? (
                        <img
                          src={conv.avatar}
                          className="w-full h-full object-cover"
                          alt={conv.name}
                          loading="lazy"
                        />
                      ) : (
                        conv.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {conv.name}
                        </p>
                        {unreadCount > 0 && (
                          <span className="bg-accent text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {getLastMessage(conv)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            {!isLoading && conversations.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {t('messaging.noConversations')}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 ${showMobileSidebar && activeConversation ? 'hidden sm:flex' : !activeConversation ? 'hidden sm:flex' : 'flex'}`}
        >
          {activeConversation ? (
            <>
              <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 shadow-sm">
                <button
                  type="button"
                  className="sm:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  onClick={() => setShowMobileSidebar(true)}
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 overflow-hidden flex-shrink-0">
                  {activeConversation.avatar ? (
                    <img
                      src={activeConversation.avatar}
                      className="w-full h-full object-cover"
                      alt={activeConversation.name}
                      loading="lazy"
                    />
                  ) : (
                    activeConversation.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {activeConversation.name}
                  </h3>
                </div>
              </div>

              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading && messages.length === 0 ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[60%]">
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-1.5" />
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20" />
                      </div>
                    </div>
                    <div className="flex items-end justify-end gap-2">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[60%]">
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-40 mb-1.5" />
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24" />
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[60%]">
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-48" />
                      </div>
                    </div>
                    <div className="flex items-end justify-end gap-2">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[60%]">
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-36" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isOwn = msg.sender === user?._id;
                      const isRead = (msg as any).readAt;
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        >
                          <div
                            className={`max-w-[70%] sm:max-w-[60%] p-3 rounded-lg text-sm shadow-sm ${
                              isOwn
                                ? 'bg-accent text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                            }`}
                          >
                            {msg.image && (
                              <a
                                href={msg.image}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mb-2"
                              >
                                <img
                                  src={msg.image}
                                  alt=""
                                  className="rounded-md max-h-48 w-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  loading="lazy"
                                />
                              </a>
                            )}
                            {msg.content && (
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            )}
                            <div
                              className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-red-100 justify-end' : 'text-gray-400 dark:text-gray-500'}`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
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
                            <span
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0ms' }}
                            ></span>
                            <span
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '150ms' }}
                            ></span>
                            <span
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '300ms' }}
                            ></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                {/* Image preview */}
                {pendingImage && (
                  <div className="mb-2 relative inline-block">
                    <img
                      src={pendingImage}
                      alt=""
                      className="h-20 rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setPendingImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {/* Emoji picker */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <SmilePlus size={20} />
                    </button>
                    {showEmojiPicker && (
                      <EmojiPicker
                        onSelect={handleEmojiSelect}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    )}
                  </div>

                  {/* Image upload */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <ImagePlus size={20} />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  <Input
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (activeConversation && e.target.value.trim()) {
                        sendTyping(activeConversation._id);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={t('messaging.writeMessage')}
                    className="flex-1 dark:bg-gray-700 dark:border-gray-600"
                    disabled={isSending}
                    maxLength={5000}
                  />
                  <Button
                    onClick={handleSend}
                    size="icon"
                    className="bg-accent hover:bg-red-700 flex-shrink-0"
                    disabled={isSending || (!inputText.trim() && !pendingImage)}
                  >
                    {isSending ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <SendHorizontal size={18} />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <MessageCircleMore size={48} className="mb-2 opacity-20" />
              <p className="text-sm">{t('messaging.selectConversation')}</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Messaging;
