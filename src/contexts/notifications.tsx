import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth';
import { supabase } from '@/integrations/supabase/client';

interface NotificationsContextType {
  hasUnreadMessages: boolean;
  unreadCount: number;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !isAdmin) {
      return;
    }

    // Função para buscar contagem de mensagens não lidas
    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('sender_type', 'client')
          .or('is_read.eq.false,is_read.is.null');

        if (error) {
          console.error('Error fetching unread count:', error);
          return;
        }

        const totalUnread = count || 0;
        setUnreadCount(totalUnread);
        setHasUnreadMessages(totalUnread > 0);
      } catch (error) {
        console.error('Error in fetchUnreadCount:', error);
      }
    };

    // Buscar contagem inicial
    fetchUnreadCount();

    // Subscription para novas mensagens de clientes
    const channel = supabase
      .channel('admin_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'sender_type=eq.client'
        },
        (payload) => {
          // Verificar se a mensagem já foi marcada como lida (tratar null como false)
          if (!payload.new.is_read) {
            setUnreadCount(prev => prev + 1);
            setHasUnreadMessages(true);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: 'sender_type=eq.client'
        },
        (payload) => {
          // Se uma mensagem foi marcada como lida
          if (payload.new.is_read && !payload.old.is_read) {
            setUnreadCount(prev => {
              const newCount = Math.max(0, prev - 1);
              setHasUnreadMessages(newCount > 0);
              return newCount;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  const markAllAsRead = async () => {
    if (!isAdmin) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_type', 'client')
        .or('is_read.eq.false,is_read.is.null');

      setUnreadCount(0);
      setHasUnreadMessages(false);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <NotificationsContext.Provider value={{
      hasUnreadMessages,
      unreadCount,
      markAllAsRead
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}; 