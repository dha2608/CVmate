import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';

const Notifications = () => {
  // Mock notifications for now as backend integration is similar to others
  const notifications = [
    { id: 1, type: 'like', text: 'John Doe liked your post', time: '2h ago', read: false },
    { id: 2, type: 'job', text: 'New job alert: Frontend Developer at Tech Corp', time: '5h ago', read: false },
    { id: 3, type: 'system', text: 'Welcome to CV Mate! Complete your profile.', time: '1d ago', read: true },
  ];

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
         <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
         </div>
         <div className="divide-y divide-gray-100">
            {notifications.map(notif => (
                <div key={notif.id} className={`p-4 flex gap-3 hover:bg-gray-50 cursor-pointer ${notif.read ? '' : 'bg-blue-50/30'}`}>
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${notif.read ? 'bg-transparent' : 'bg-accent'}`}></div>
                    <div>
                        <p className="text-sm text-gray-800">{notif.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;
