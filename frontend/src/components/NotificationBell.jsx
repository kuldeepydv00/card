import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info, BellRing, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (notification) => {
    if (notification.type === 'win') return <BellRing size={20} className="text-yellow-400" />;
    if (notification.type === 'deposit') return notification.title?.includes('Approved') ? <CheckCircle size={20} className="text-green-400" /> : <Info size={20} className="text-blue-400" />;
    if (notification.type === 'withdrawal') return notification.title?.includes('Approved') ? <CheckCircle size={20} className="text-green-400" /> : notification.title?.includes('Rejected') ? <XCircle size={20} className="text-red-400" /> : <Info size={20} className="text-blue-400" />;
    return <Info size={20} className="text-gray-400" />;
  };

  const handleNotificationClick = (id) => {
    markAsRead(id);
    // Could navigate here if needed based on type
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm';
    return 'Just now';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors relative"
      >
        <Bell size={20} className="text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="notification-dropdown"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-4 w-80 bg-surface/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="font-bold text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">{unreadCount} New</span>
                )}
              </h3>
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification._id)}
                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors flex gap-4 ${!notification.is_read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="mt-1">
                      {getIcon(notification)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-semibold ${!notification.is_read ? 'text-white' : 'text-gray-300'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                          {timeAgo(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-400 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-white/5 text-center bg-black/20">
                <button className="text-[11px] text-gray-400 hover:text-white uppercase tracking-widest font-bold transition-colors">
                  View All Activity
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
