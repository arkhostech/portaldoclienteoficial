import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchConversations, 
  fetchInitialMessages,
  fetchOlderMessages, 
  sendMessage, 
  createConversation,
  markMessagesAsRead,
  subscribeToMessages,
  subscribeToConversations
} from '@/services/messages';
import { Conversation, Message } from '@/services/messages/types';
import { toast } from '@/hooks/use-toast';

export const useChat = (clientId?: string) => {
  const { user, isAdmin } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messageChannel, setMessageChannel] = useState<RealtimeChannel | null>(null);
  const [conversationChannel, setConversationChannel] = useState<RealtimeChannel | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState<Set<string>>(new Set());
  const [unreadByConversation, setUnreadByConversation] = useState<Map<string, number>>(new Map());

  // Load initial messages for a specific conversation (últimas 20)
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      const data = await fetchInitialMessages(conversationId);
      setMessages(data);
      setHasMoreMessages(data.length === 20); // Se retornou 20, pode ter mais
      
      // Mark messages as read
      await markMessagesAsRead(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as mensagens',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load older messages (para scroll infinito)
  const loadOlderMessages = useCallback(async (conversationId: string) => {
    if (!conversationId || !hasMoreMessages || loadingOlder) return;
    
    try {
      setLoadingOlder(true);
      setShouldAutoScroll(false); // Não fazer auto-scroll ao carregar mensagens antigas
      
      const oldestMessage = messages[0];
      if (!oldestMessage) return;
      
      const olderMessages = await fetchOlderMessages(conversationId, oldestMessage.created_at);
      
      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
        return;
      }
      
      // Adiciona as mensagens antigas no início
      setMessages(prev => [...olderMessages, ...prev]);
      setHasMoreMessages(olderMessages.length === 20);
      
    } catch (error) {
      console.error('Error loading older messages:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar mensagens antigas',
        variant: 'destructive'
      });
    } finally {
      setLoadingOlder(false);
      // NÃO resetar auto-scroll automaticamente
      // Será reativado apenas quando nova mensagem chegar ou usuário rolar para baixo
    }
  }, [messages, hasMoreMessages, loadingOlder]);

  // Load all conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await fetchConversations(isAdmin, user.id);
      setConversations(data);
      
      // Se for admin, carregar contagem de mensagens não lidas para cada conversa
      if (isAdmin && data.length > 0) {
        const unreadCountPromises = data.map(async (conversation) => {
          try {
            const { count } = await supabase
              .from('messages')
              .select('id', { count: 'exact' })
              .eq('conversation_id', conversation.id)
              .eq('sender_type', 'client')
              .or('is_read.eq.false,is_read.is.null');
            
            return { conversationId: conversation.id, count: count || 0 };
          } catch (error) {
            console.error(`Error counting unread messages for conversation ${conversation.id}:`, error);
            return { conversationId: conversation.id, count: 0 };
          }
        });

        const unreadCounts = await Promise.all(unreadCountPromises);
        
                 // Atualizar mapa de não lidas por conversa
        const newUnreadMap = new Map<string, number>();
        unreadCounts.forEach(({ conversationId, count }) => {
          if (count > 0) {
            newUnreadMap.set(conversationId, count);
          }
        });
                 setUnreadByConversation(newUnreadMap);
      }
      
      // Auto-select the first conversation for clients (they only have one)
      if (!isAdmin && data.length > 0 && !activeConversation) {
        setActiveConversation(data[0]);
        await loadMessages(data[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as conversas',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin, activeConversation, loadMessages]);

  // Send a message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || !activeConversation) return;
    
    const senderType = isAdmin ? 'admin' : 'client';
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    
    // Optimistic update - adicionar mensagem imediatamente na UI
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: activeConversation.id,
      sender_type: senderType,
      sender_id: user.id,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    };
    
    // Adicionar imediatamente na lista
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Reativar auto-scroll quando usuário enviar mensagem
    setShouldAutoScroll(true);
    
    try {
      setIsSending(true);
      
      // Enviar para o servidor
      const sentMessage = await sendMessage(
        activeConversation.id,
        content,
        user.id,
        senderType
      );
      
      // Substituir a mensagem temporária pela real quando chegar via subscription
      // Não fazemos nada aqui - deixamos a subscription handle
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remover a mensagem temporária em caso de erro
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  }, [user, activeConversation, isAdmin]);

  // Start a new conversation (especially for clients)
  const handleStartConversation = useCallback(async (targetClientId: string, processType: string | null = null) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Check if conversation already exists for this client
      const existingConversation = conversations.find(conv => conv.client_id === targetClientId);
      if (existingConversation) {
        setActiveConversation(existingConversation);
        await loadMessages(existingConversation.id);
        return;
      }
      
      // If no existing conversation found locally, check database as well
      const { data: dbConversations } = await supabase
        .from('conversations')
        .select(`
          *,
          client:client_id (
            full_name,
            email,
            phone,
            status,
            process_type_id
          )
        `)
        .eq('client_id', targetClientId)
        .limit(1);
        
      if (dbConversations && dbConversations.length > 0) {
        const existingDbConversation = dbConversations[0];
        setActiveConversation(existingDbConversation);
        await loadMessages(existingDbConversation.id);
        // Also add to local state if not present
        setConversations(prev => {
          const exists = prev.find(c => c.id === existingDbConversation.id);
          if (!exists) {
            return [existingDbConversation, ...prev];
          }
          return prev;
        });
        return;
      }
      
      // Create new conversation
      const newConversation = await createConversation(
        targetClientId, 
        processType
      );
      
      // Add the new conversation to the list
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setMessages([]);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar uma nova conversa',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin, conversations, loadMessages]);

  // Set active conversation and load its messages
  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    setActiveConversation(conversation);
    await loadMessages(conversation.id);
  }, [loadMessages]);

  // Reativar auto-scroll (quando usuário rola para próximo do final)
  const reactivateAutoScroll = useCallback(() => {
    setShouldAutoScroll(true);
  }, []);

  // Marcar mensagem como vista (remove das não lidas)
  const markMessageAsViewed = useCallback(async (messageId: string, conversationId: string) => {
    // Marcar como lida no banco de dados
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }

    setUnreadMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });

    setUnreadByConversation(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(conversationId) || 0;
      if (current > 0) {
        newMap.set(conversationId, current - 1);
      }
      return newMap;
    });
  }, []);

  // Marcar várias mensagens como vistas
  const markMessagesAsViewed = useCallback((messageIds: string[], conversationId: string) => {
    setUnreadMessages(prev => {
      const newSet = new Set(prev);
      messageIds.forEach(id => newSet.delete(id));
      return newSet;
    });

    setUnreadByConversation(prev => {
      const newMap = new Map(prev);
      const currentCount = newMap.get(conversationId) || 0;
      const newCount = Math.max(0, currentCount - messageIds.length);
      newMap.set(conversationId, newCount);
      return newMap;
    });
  }, []);

  // Verificar se tem mensagens não lidas
  const hasUnreadMessages = unreadMessages.size > 0;
  const getUnreadCount = useCallback((conversationId: string) => {
    return unreadByConversation.get(conversationId) || 0;
  }, [unreadByConversation]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to conversations based on user type
    if (isAdmin) {
      // Admin subscribes to all conversations
      const channel = subscribeToConversations((updatedConversation) => {
        // Update the conversation list
        setConversations(prev => {
          const index = prev.findIndex(c => c.id === updatedConversation.id);
          if (index >= 0) {
            // Update existing conversation
            const updated = [...prev];
            updated[index] = { ...updated[index], ...updatedConversation };
            return updated;
          } else {
            // Add new conversation
            return [updatedConversation, ...prev];
          }
        });
      });
      
      setConversationChannel(channel);
    } else {
      // Client subscribes to conversations where they are the client_id
      const channel = supabase
        .channel('client_conversations')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'conversations',
            filter: `client_id=eq.${user.id}`
          },
          async (payload) => {
            // Fetch the conversation with client data
            const { data } = await supabase
              .from('conversations')
              .select(`
                *,
                client:client_id (
                  full_name,
                  email,
                  phone,
                  status,
                  process_type_id
                )
              `)
              .eq('id', payload.new.id)
              .single();
              
            if (data) {
              setConversations(prev => [data, ...prev]);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
            filter: `client_id=eq.${user.id}`
          },
          async (payload) => {
            // Update existing conversation
            const { data } = await supabase
              .from('conversations')
              .select(`
                *,
                client:client_id (
                  full_name,
                  email,
                  phone,
                  status,
                  process_type_id
                )
              `)
              .eq('id', payload.new.id)
              .single();
              
            if (data) {
              setConversations(prev => {
                const index = prev.findIndex(c => c.id === data.id);
                if (index >= 0) {
                  const updated = [...prev];
                  updated[index] = { ...updated[index], ...data };
                  return updated;
                } else {
                  return [data, ...prev];
                }
              });
            }
          }
        )
        .subscribe();
        
      setConversationChannel(channel);
    }

    // Load initial conversations
    loadConversations();

    return () => {
      // Cleanup subscription
      if (conversationChannel) {
        supabase.removeChannel(conversationChannel);
      }
    };
  }, [user, isAdmin, loadConversations]);

  // Subscription global para todas as mensagens de clientes (apenas para admin)
  useEffect(() => {
    if (!user || !isAdmin) return;

    const channel = supabase
      .channel('admin_all_client_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'sender_type=eq.client'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Só processar se não for uma mensagem da conversa ativa
          // (pois essas já são tratadas pela subscription específica)
          if (!activeConversation || newMessage.conversation_id !== activeConversation.id) {
            // Adicionar às mensagens não lidas
            setUnreadMessages(prevUnread => {
              const newSet = new Set(prevUnread);
              newSet.add(newMessage.id);
              return newSet;
            });

                         // Incrementar contador da conversa específica
            setUnreadByConversation(prevMap => {
              const newMap = new Map(prevMap);
              const current = newMap.get(newMessage.conversation_id) || 0;
              newMap.set(newMessage.conversation_id, current + 1);
                             return newMap;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, activeConversation]);

  // Subscribe to messages for active conversation
  useEffect(() => {
    if (!activeConversation) {
      // Clear messages when no active conversation
      setMessages([]);
      return;
    }
    
    const channel = subscribeToMessages(activeConversation.id, (newMessage) => {
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.find(msg => msg.id === newMessage.id);
        if (!exists) {
          // Verificar se há mensagem temporária do mesmo usuário para substituir
          const tempMessageIndex = prev.findIndex(msg => 
            msg.id.startsWith('temp-') && 
            msg.sender_id === newMessage.sender_id &&
            msg.content === newMessage.content &&
            Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 5000 // 5 segundos de diferença
          );
          
          if (tempMessageIndex >= 0) {
            // Substituir mensagem temporária pela real
            const updated = [...prev];
            updated[tempMessageIndex] = newMessage;
            return updated;
          } else {
            // Se for admin e a mensagem for de cliente, marcar como não lida
            if (isAdmin && newMessage.sender_type === 'client') {
              setUnreadMessages(prevUnread => {
                const newSet = new Set(prevUnread);
                newSet.add(newMessage.id);
                return newSet;
              });

              setUnreadByConversation(prevMap => {
                const newMap = new Map(prevMap);
                const current = newMap.get(activeConversation.id) || 0;
                newMap.set(activeConversation.id, current + 1);
                return newMap;
              });
            }

            // Reativar auto-scroll quando nova mensagem chegar
            setShouldAutoScroll(true);
            return [...prev, newMessage];
          }
        }
        return prev;
      });
      
      // Update conversation updated_at to move it to top of list
      setConversations(prev => {
        const updated = [...prev];
        const convIndex = updated.findIndex(c => c.id === activeConversation.id);
        if (convIndex >= 0) {
          updated[convIndex] = {
            ...updated[convIndex],
            updated_at: newMessage.created_at
          };
          // Move to top
          const [conv] = updated.splice(convIndex, 1);
          updated.unshift(conv);
        }
        return updated;
      });
    });
    
    setMessageChannel(channel);
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [activeConversation]);

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSending,
    hasMoreMessages,
    loadingOlder,
    shouldAutoScroll,
    loadConversations,
    loadMessages,
    loadOlderMessages,
    handleSendMessage,
    handleStartConversation,
    handleSelectConversation,
    reactivateAutoScroll,
    markMessageAsViewed,
    markMessagesAsViewed,
    hasUnreadMessages,
    getUnreadCount,
  };
};
