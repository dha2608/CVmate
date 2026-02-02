import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useNotificationStore, Notification } from '@/store/notificationStore';
import { useI18n } from '@/store/i18nStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  Briefcase, 
  MessageCircle, 
  Bell, 
  ShieldAlert, 
  UserPlus, 
  CheckCheck, 
  Trash2, 
  Clock,
  Loader2,
  Filter,
  Search,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'like':
      return <div className="p-2 bg-pink-100 text-pink-600 rounded-full"><Heart size={18} fill="currentColor" /></div>;
    case 'job':
      return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Briefcase size={18} /></div>;
    case 'comment':
      return <div className="p-2 bg-green-100 text-green-600 rounded-full"><MessageCircle size={18} /></div>;
    case 'connection':
      return <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full"><UserPlus size={18} /></div>;
    case 'security':
      return <div className="p-2 bg-red-100 text-red-600 rounded-full"><ShieldAlert size={18} /></div>;
    default:
      return <div className="p-2 bg-gray-100 text-gray-600 rounded-full"><Bell size={18} /></div>;
  }
};

const Notifications = () => {
  const { 
    notifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isLoading 
  } = useNotificationStore();
  const { t } = useI18n();
  
  const [filter, setFilter] = useState<'all' | 'unread' | Notification['type']>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread' && notif.isRead) return false;
    if (filter !== 'all' && filter !== 'unread' && notif.type !== filter) return false;
    if (searchTerm && !notif.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
             <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-3">
                 <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('notifications.title')}</h1>
                 {notifications.some(n => !n.isRead) && (
                   <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                     {notifications.filter(n => !n.isRead).length} {t('notifications.new')}
                   </span>
                 )}
               </div>
               {notifications.length > 0 && (
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => markAllAsRead()}
                   className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm"
                 >
                   <CheckCheck size={16} className="mr-1.5" />
                   {t('notifications.markAllRead')}
                 </Button>
               )}
             </div>

             {/* Search and Filters */}
             <div className="space-y-3">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                 <Input
                   placeholder={t('notifications.searchPlaceholder')}
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 dark:bg-gray-700 dark:border-gray-600"
                 />
                 {searchTerm && (
                   <button
                     onClick={() => setSearchTerm('')}
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                   >
                     <X size={16} />
                   </button>
                 )}
               </div>
               <div className="flex items-center gap-2 flex-wrap">
                 <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                 <Button
                   variant={filter === 'all' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setFilter('all')}
                   className="text-xs"
                 >
                   {t('notifications.all')}
                 </Button>
                 <Button
                   variant={filter === 'unread' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setFilter('unread')}
                   className="text-xs"
                 >
                   {t('notifications.unread')}
                 </Button>
                 <Button
                   variant={filter === 'like' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setFilter('like')}
                   className="text-xs"
                 >
                   <Heart size={12} className="mr-1" />
                   {t('notifications.likes')}
                 </Button>
                 <Button
                   variant={filter === 'comment' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setFilter('comment')}
                   className="text-xs"
                 >
                   <MessageCircle size={12} className="mr-1" />
                   {t('notifications.comments')}
                 </Button>
                 <Button
                   variant={filter === 'job' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setFilter('job')}
                   className="text-xs"
                 >
                   <Briefcase size={12} className="mr-1" />
                   {t('notifications.jobs')}
                 </Button>
               </div>
             </div>
          </div>

          {/* List */}
          <div className="divide-y divide-gray-50">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
                <p className="text-gray-500 text-sm">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="h-16 w-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Bell size={32} className="text-gray-300 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('notifications.noNotifications')}</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-1">
                  {searchTerm || filter !== 'all' 
                    ? t('notifications.noMatchingNotifications')
                    : t('notifications.noNotificationsDesc')}
                </p>
              </div>
            ) : (
              filteredNotifications.map(notif => (
                <div 
                  key={notif._id} 
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                  className={`group p-4 flex gap-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 animate-fade-in ${
                    !notif.isRead ? 'bg-indigo-50/40 dark:bg-indigo-900/20' : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {notif.sender?.avatar ? (
                      <div className="relative">
                        <img 
                          src={notif.sender.avatar} 
                          alt="Avatar" 
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div className="absolute -bottom-1 -right-1 scale-75">
                          <NotificationIcon type={notif.type} />
                        </div>
                      </div>
                    ) : (
                      <NotificationIcon type={notif.type} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notif.sender && <span className="font-bold text-indigo-700">{notif.sender.name} </span>}
                        {notif.message}
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 ml-auto mr-2"></span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;