import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth';
import { supabase } from '@/integrations/supabase/client';

interface ClientNotificationsContextType {
  hasUnreadMessages: boolean;
  unreadCount: number;
  markAllAsRead: () => void;
  forceRefreshCount: () => void; // 🆕 Função para forçar refresh
}

const ClientNotificationsContext = createContext<ClientNotificationsContextType | undefined>(undefined);

export const ClientNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 🎯 APENAS CLIENTE: Sistema baseado no admin que funciona
    if (!user || isAdmin) {
      // Admin não usa este contexto
      setHasUnreadMessages(false);
      setUnreadCount(0);
      return;
    }

    // Função para buscar contagem de mensagens não lidas - APENAS CLIENTE
    const fetchUnreadCount = async () => {
      try {
        // Para cliente: contar mensagens do admin não lidas na conversa do cliente
        const { data: conversationsData } = await supabase
          .from('conversations')
          .select('id')
          .eq('client_id', user.id);
        
        if (!conversationsData || conversationsData.length === 0) {
          setUnreadCount(0);
          setHasUnreadMessages(false);
          return;
        }
        
        const conversationIds = conversationsData.map(conv => conv.id);
        
        const { count, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('sender_type', 'admin')
          .eq('is_read', false)
          .in('conversation_id', conversationIds);

        if (error) {
          console.error('Error fetching unread count:', error);
          return;
        }

        const totalUnread = count || 0;
        setUnreadCount(totalUnread);
        setHasUnreadMessages(totalUnread > 0);
        if (totalUnread > 0) {
          console.log('🔔 CLIENT: Contagem inicial:', totalUnread);
        }
      } catch (error) {
        console.error('Error in fetchUnreadCount:', error);
      }
    };

    // Buscar contagem inicial
    fetchUnreadCount();

    // Subscription para novas mensagens - APENAS CLIENTE
    const channel = supabase
      .channel('client_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'sender_type=eq.admin'
        },
        async (payload) => {
          console.log('🔔 CLIENT: Nova mensagem recebida');
          
          // Para cliente, verificar se a mensagem é para ele
          const { data: conversation } = await supabase
            .from('conversations')
            .select('client_id')
            .eq('id', payload.new.conversation_id)
            .single();
          
          if (!conversation || conversation.client_id !== user.id) {
            return;
          }
          
          // Verificar se a mensagem já foi marcada como lida (tratar null como false)
          if (!payload.new.is_read) {
            console.log('✅ CLIENT: Incrementando contador (nova mensagem do admin)');
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
          table: 'messages'
        },
        async (payload) => {
          // 🔥 CORREÇÃO: Cliente só deve decrementar quando mensagens do ADMIN são marcadas como lidas
          if (payload.new.sender_type !== 'admin') {
            return;
          }
          
          // Para cliente, verificar se a mensagem é para ele
          const { data: conversation } = await supabase
            .from('conversations')
            .select('client_id')
            .eq('id', payload.new.conversation_id)
            .single();
          
          if (!conversation || conversation.client_id !== user.id) {
            return;
          }
          
          // Se uma mensagem do ADMIN foi marcada como lida
          if (payload.new.is_read && !payload.old.is_read) {
            console.log('✅ CLIENT: Decrementando contador (mensagem do admin marcada como lida)');
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
    if (!user || isAdmin) return;

    try {
      console.log('🧪 CLIENT: Marcando todas como lidas...');
      
      // Para cliente: marcar mensagens do admin como lidas na conversa do cliente
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', user.id);
      
      if (conversationsData && conversationsData.length > 0) {
        const conversationIds = conversationsData.map(conv => conv.id);
        
        // Usar markConversationMessagesAsRead que funciona com RLS
        const { markConversationMessagesAsRead } = await import('../services/messages');
        
        for (const conversationId of conversationIds) {
          console.log('🧪 CLIENT: Marcando conversa como lida:', conversationId);
          await markConversationMessagesAsRead(conversationId, 'admin');
          console.log('🧪 CLIENT: Conversa marcada:', conversationId);
        }
        
        console.log('🧪 CLIENT: Mensagens marcadas como lidas');
      }

      setUnreadCount(0);
      setHasUnreadMessages(false);
      console.log('🧪 CLIENT: Estado local resetado');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };



  // 🆕 Função para forçar refresh da contagem
  const forceRefreshCount = async () => {
    if (!user || isAdmin) return;

    try {
      console.log('🔄 CLIENT: Forçando refresh da contagem...');
      
      // Para cliente: contar mensagens do admin não lidas na conversa do cliente
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', user.id);
      
      if (!conversationsData || conversationsData.length === 0) {
        setUnreadCount(0);
        setHasUnreadMessages(false);
        return;
      }
      
      const conversationIds = conversationsData.map(conv => conv.id);
      
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('sender_type', 'admin')
        .eq('is_read', false)
        .in('conversation_id', conversationIds);

      if (error) {
        console.error('Error in force refresh:', error);
        return;
      }

      const totalUnread = count || 0;
      setUnreadCount(totalUnread);
      setHasUnreadMessages(totalUnread > 0);
      console.log('🔄 CLIENT: Contagem atualizada via force refresh:', totalUnread);
    } catch (error) {
      console.error('Error in forceRefreshCount:', error);
    }
  };

  return (
    <ClientNotificationsContext.Provider value={{
      hasUnreadMessages,
      unreadCount,
      markAllAsRead,
      forceRefreshCount
    }}>
      {children}
    </ClientNotificationsContext.Provider>
  );
};

export const useClientNotifications = () => {
  const context = useContext(ClientNotificationsContext);
  if (context === undefined) {
    throw new Error('useClientNotifications must be used within a ClientNotificationsProvider');
  }
  return context;
}; 