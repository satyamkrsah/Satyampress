import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Bell, Check, Trash2, CheckCircle2 } from 'lucide-react';

const AccountNotifications = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications 
  } = useNotification();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800 gap-4">
        <h2 className="text-2xl font-serif font-semibold text-black dark:text-cream-dark flex items-center gap-3">
          Notifications
          {unreadCount > 0 && (
            <span className="text-sm font-normal bg-gold text-white px-3 py-1 rounded-full">
              {unreadCount} Unread
            </span>
          )}
        </h2>
        
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="flex items-center gap-1 px-3 py-1.5 text-xs uppercase tracking-wider border border-gold text-gold hover:bg-gold hover:text-white transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark All Read
              </button>
            )}
            <button 
              onClick={() => {
                if(window.confirm('Are you sure you want to clear all notifications?')) {
                  clearAllNotifications();
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs uppercase tracking-wider border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-surface-dark border border-dashed border-gray-300 dark:border-gray-700">
          <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">You're all caught up!</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back later for new updates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notif => (
            <div 
              key={notif._id} 
              className={`p-5 border flex items-start justify-between gap-4 transition-all duration-300 ${notif.isRead ? 'bg-white dark:bg-black border-gray-200 dark:border-gray-800' : 'bg-gold/5 dark:bg-gold/10 border-gold shadow-sm'}`}
            >
              <div className="flex gap-4">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-gold'}`} />
                <div>
                  <h4 className={`font-semibold text-sm ${notif.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-black dark:text-white'}`}>
                    {notif.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500 block mt-3 uppercase tracking-wider">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {!notif.isRead && (
                  <button 
                    onClick={() => markAsRead(notif._id)}
                    className="p-2 text-gold hover:bg-gold hover:text-white rounded-full transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(notif._id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountNotifications;
