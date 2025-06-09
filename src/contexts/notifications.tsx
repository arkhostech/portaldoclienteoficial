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
    if (!user) {
      return;
    }

    // 🎯 APENAS ADMIN: Sistema de notificações simplificado
    if (!isAdmin) {
      // Cliente não usa este contexto para bolinha verde (só sticky banner)
      setHasUnreadMessages(false);
      setUnreadCount(0);
      return;
    }

    // Função para buscar contagem de mensagens não lidas - APENAS ADMIN
    const fetchUnreadCount = async () => {
      try {
        // Para admin: contar mensagens de clientes não lidas
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

    // Subscription para novas mensagens - APENAS ADMIN
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
        async (payload) => {
          console.log('🔔 ADMIN: INSERT recebido:', {
            messageId: payload.new.id,
            senderType: payload.new.sender_type,
            isRead: payload.new.is_read
          });
          
          // Verificar se a mensagem já foi marcada como lida (tratar null como false)
          if (!payload.new.is_read) {
            console.log('✅ ADMIN: Incrementando contador');
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
        async (payload) => {
          console.log('🎯 ADMIN: UPDATE recebido:', {
            messageId: payload.new.id,
            senderType: payload.new.sender_type,
            wasRead: payload.old.is_read,
            nowRead: payload.new.is_read
          });
          
          // Se uma mensagem foi marcada como lida
          if (payload.new.is_read && !payload.old.is_read) {
            console.log('✅ ADMIN: Decrementando contador para mensagem:', payload.new.id);
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
    if (!user || !isAdmin) return;

    try {
      console.log('🧪 ADMIN: Marcando todas como lidas...');
      // Para admin: marcar mensagens de clientes como lidas
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_type', 'client')
        .or('is_read.eq.false,is_read.is.null');

      setUnreadCount(0);
      setHasUnreadMessages(false);
      console.log('🧪 ADMIN: Estado local resetado');
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