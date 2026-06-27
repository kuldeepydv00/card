import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { BellRing, CheckCircle, XCircle, Info } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('new_notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show toast based on type
        let icon = <Info size={18} />;
        if (notification.type === 'win') icon = <BellRing size={18} className="text-yellow-400" />;
        if (notification.type === 'deposit') icon = notification.title.includes('Approved') ? <CheckCircle size={18} className="text-green-400"/> : <Info size={18} className="text-blue-400" />;
        if (notification.type === 'withdrawal') icon = notification.title.includes('Approved') ? <CheckCircle size={18} className="text-green-400"/> : notification.title.includes('Rejected') ? <XCircle size={18} className="text-red-400"/> : <Info size={18} className="text-blue-400" />;

        toast(notification.message, {
          icon,
          duration: 5000,
          position: 'top-right',
          className: 'bg-surface border border-white/10 text-white',
        });
      });
    }
    
    return () => {
      if (socket) {
        socket.off('new_notification');
      }
    };
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => 
        prev.map(n => n._id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    // Optional utility if we implement "Mark All as Read"
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n._id);
    for (const id of unreadIds) {
      await markAsRead(id);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
