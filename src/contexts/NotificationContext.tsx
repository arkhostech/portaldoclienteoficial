import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationContextType {
  totalUnread: number;
  hasNotification: (conversationId: string) => boolean;
  addNotification: (conversationId: string, messageId: string) => void;
  markAsRead: (conversationId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const STORAGE_KEY = 'portal_notifications';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [unreadConversations, setUnreadConversations] = useState<Record<string, string[]>>({});
  const [messageChannel, setMessageChannel] = useState<RealtimeChannel | null>(null);
  const [hasCheckedOfflineMessages, setHasCheckedOfflineMessages] = useState(false);

  // Carregar notificações do localStorage
  useEffect(() => {
    if (!user) return;

    const storageKey = `${STORAGE_KEY}_${user.id}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUnreadConversations(parsed);
      } catch (error) {
        console.error('Error parsing stored notifications:', error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [user]);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    if (!user) return;
    
    const storageKey = `${STORAGE_KEY}_${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(unreadConversations));
  }, [unreadConversations, user]);

  // Obter total de notificações
  const totalUnread = Object.keys(unreadConversations).length;
  


  // Verificar se uma conversa tem notificação
  const hasNotification = useCallback((conversationId: string) => {
    return Boolean(unreadConversations[conversationId]?.length > 0);
  }, [unreadConversations]);

  // Adicionar notificação
  const addNotification = useCallback((conversationId: string, messageId: string) => {
    setUnreadConversations(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), messageId]
    }));
  }, []);

  // Marcar conversa como lida
  const markAsRead = useCallback((conversationId: string) => {
    setUnreadConversations(prev => {
      const newState = { ...prev };
      delete newState[conversationId];
      return newState;
    });
  }, []);

  // Limpar todas as notificações
  const clearAll = useCallback(() => {
    setUnreadConversations({});
  }, []);

  // Verificar mensagens recebidas enquanto offline
  const checkOfflineMessages = useCallback(async () => {
    if (!user || hasCheckedOfflineMessages) return;

    try {
      // Obter timestamp do último logout
      const lastLogoutKey = `last_logout_${user.id}`;
      const lastLogoutTime = localStorage.getItem(lastLogoutKey);
      
      if (!lastLogoutTime) {
        // Primeira vez logando, não há mensagens offline
        setHasCheckedOfflineMessages(true);
        return;
      }

      // Buscar mensagens criadas após o último logout onde o usuário não é o sender
      const { data: offlineMessages, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          sender_type,
          created_at,
          conversation:conversation_id (
            client_id
          )
        `)
        .gt('created_at', lastLogoutTime)
        .neq('sender_id', user.id);

      if (error) {
        console.error('Error fetching offline messages:', error);
        setHasCheckedOfflineMessages(true);
        return;
      }

      if (offlineMessages && offlineMessages.length > 0) {
        // Filtrar mensagens relevantes para este usuário
        const relevantMessages = offlineMessages.filter(msg => {
          if (isAdmin) {
            // Admin recebe notificações de mensagens de clientes
            return msg.sender_type === 'client';
          } else {
            // Cliente recebe notificações de mensagens de admins em suas próprias conversas
            return msg.sender_type === 'admin' && 
                   msg.conversation && 
                   msg.conversation.client_id === user.id;
          }
        });

        // Adicionar essas mensagens como notificações
        const newNotifications: Record<string, string[]> = {};
        relevantMessages.forEach(msg => {
          if (!newNotifications[msg.conversation_id]) {
            newNotifications[msg.conversation_id] = [];
          }
          newNotifications[msg.conversation_id].push(msg.id);
        });

        // Mesclar com notificações existentes
        setUnreadConversations(prev => {
          const merged = { ...prev };
          Object.entries(newNotifications).forEach(([convId, messageIds]) => {
            if (merged[convId]) {
              // Adicionar apenas IDs que não existem
              const existingIds = new Set(merged[convId]);
              const newIds = messageIds.filter(id => !existingIds.has(id));
              merged[convId] = [...merged[convId], ...newIds];
            } else {
              merged[convId] = messageIds;
            }
          });
          return merged;
        });

        console.log(`📬 Encontradas ${relevantMessages.length} mensagens offline para ${user.id}`);
      }

      setHasCheckedOfflineMessages(true);
    } catch (error) {
      console.error('Error checking offline messages:', error);
      setHasCheckedOfflineMessages(true);
    }
  }, [user, isAdmin, hasCheckedOfflineMessages]);

  // Salvar timestamp quando o usuário sai (cleanup)
  const saveLogoutTime = useCallback(() => {
    if (user) {
      const logoutKey = `last_logout_${user.id}`;
      localStorage.setItem(logoutKey, new Date().toISOString());
    }
  }, [user]);

  // Subscription global para todas as mensagens
  useEffect(() => {
    if (!user) {
      if (messageChannel) {
        supabase.removeChannel(messageChannel);
        setMessageChannel(null);
      }
      return;
    }

    const channel = supabase
      .channel(`global_messages_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as any;
          
          // Só adicionar notificação se a mensagem NÃO é do usuário atual
          if (newMessage.sender_id !== user.id) {
            // Para admins: notificação apenas de mensagens de clientes
            // Para clientes: notificação apenas de mensagens de admins
            const shouldNotify = isAdmin 
              ? newMessage.sender_type === 'client'
              : newMessage.sender_type === 'admin';
              
            if (shouldNotify) {
              addNotification(newMessage.conversation_id, newMessage.id);
            }
          }
        }
      )
      .subscribe();

    setMessageChannel(channel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, isAdmin, addNotification]);

  // Verificar mensagens offline quando o usuário loga
  useEffect(() => {
    if (user && !hasCheckedOfflineMessages) {
      checkOfflineMessages();
    }
  }, [user, hasCheckedOfflineMessages, checkOfflineMessages]);



  // Reset do estado quando o usuário troca
  useEffect(() => {
    if (user) {
      setHasCheckedOfflineMessages(false);
    }
  }, [user?.id]);

  const value = {
    totalUnread,
    hasNotification,
    addNotification,
    markAsRead,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// Hook para ser usado pelo AuthContext 
export function useLogoutHandler() {
  const { user } = useAuth();
  
  const saveLogoutTime = useCallback(() => {
    if (user) {
      const logoutKey = `last_logout_${user.id}`;
      localStorage.setItem(logoutKey, new Date().toISOString());
      console.log('💾 Logout time saved for user:', user.id);
    }
  }, [user]);

  return { saveLogoutTime };
} 