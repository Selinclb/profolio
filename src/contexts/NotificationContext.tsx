import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  type: 'message' | 'task';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Mesaj bildirimlerini getir
    const { data: messageNotifications, error: messageError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'message')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    // Yaklaşan görev bildirimlerini getir
    const { data: taskNotifications, error: taskError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'task')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    if (messageError || taskError) {
      console.error('Bildirimler getirilirken hata oluştu:', messageError || taskError);
      return;
    }

    const allNotifications = [
      ...(messageNotifications || []),
      ...(taskNotifications || [])
    ].map(notification => ({
      ...notification,
      timestamp: new Date(notification.created_at)
    }));

    setNotifications(allNotifications);
  };

  const markAsRead = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Bildirim okundu olarak işaretlenirken hata oluştu:', error);
      return;
    }

    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markAsRead,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 