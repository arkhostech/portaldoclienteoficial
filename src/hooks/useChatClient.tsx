import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchConversations, 
  fetchInitialMessages,
  fetchOlderMessages, 
  sendMessage, 
  createConversation,
  subscribeToMessages,
  markConversationMessagesAsRead
} from '@/services/messages';
import { chatCache } from '@/utils/cache';
import { Conversation, Message } from '@/services/messages/types';
import { toast } from '@/hooks/use-toast';

export const useChatClient = () => {
  const { user, isAdmin } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messageChannel, setMessageChannel] = useState<RealtimeChannel | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  // 🎯 DIFERENÇA: Cliente NÃO gerencia unread localmente - deixa para ClientNotificationsProvider
  // Removi: unreadMessages, unreadByConversation, pendingNewMessages
  
  const [isViewingOldMessages, setIsViewingOldMessages] = useState(false);
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null);
  
  // 🛡️ DEBOUNCE: Evitar chamadas múltiplas do Intersection Observer
  const [markingAsViewed, setMarkingAsViewed] = useState<Set<string>>(new Set());
  
  const isViewingOldMessagesRef = useRef(isViewingOldMessages);
  const scrollContainerRefRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    isViewingOldMessagesRef.current = isViewingOldMessages;
  }, [isViewingOldMessages]);
  
  useEffect(() => {
    scrollContainerRefRef.current = scrollContainerRef;
  }, [scrollContainerRef]);

  // 🎯 ESPECÍFICO CLIENTE: Sistema de persistência simplificado (sem unread tracking)
  const [pendingSends, setPendingSends] = useState<Map<string, {
    conversationId: string;
    content: string;
    senderId: string;
    senderType: 'client';
    retryCount: number;
  }>>(new Map());

  const PENDING_MESSAGES_KEY = 'chat_pending_messages_client';

  useEffect(() => {
    try {
      const savedPending = localStorage.getItem(PENDING_MESSAGES_KEY);
      if (savedPending) {
        const parsed = JSON.parse(savedPending);
        const pendingMap = new Map();
        
        for (const [key, value] of Object.entries(parsed)) {
          if (value && typeof value === 'object' && 
              'conversationId' in value && 'content' in value) {
            pendingMap.set(key, value as any);
          }
        }
        
        setPendingSends(pendingMap);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens pendentes do localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (pendingSends.size > 0) {
        const pendingObject = Object.fromEntries(pendingSends);
        localStorage.setItem(PENDING_MESSAGES_KEY, JSON.stringify(pendingObject));
      } else {
        localStorage.removeItem(PENDING_MESSAGES_KEY);
      }
    } catch (error) {
      console.error('Erro ao salvar mensagens pendentes no localStorage:', error);
    }
  }, [pendingSends]);

  const loadMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      const messagesData = await fetchInitialMessages(conversationId);
      setMessages(messagesData);
      setHasMoreMessages(messagesData.length >= 20);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadOlderMessages = useCallback(async () => {
    if (!activeConversation || loadingOlder || !hasMoreMessages) return;

    try {
      setLoadingOlder(true);
      const oldestMessage = messages[0];
      if (!oldestMessage) return;

      const olderMessages = await fetchOlderMessages(activeConversation.id, oldestMessage.created_at);
      
      if (olderMessages.length > 0) {
        setMessages(prev => [...olderMessages, ...prev]);
        setHasMoreMessages(olderMessages.length >= 20);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setLoadingOlder(false);
    }
  }, [activeConversation, messages, loadingOlder, hasMoreMessages]);

  const loadConversations = useCallback(async () => {
    if (!user || isAdmin) return;

    try {
      const conversationsData = await fetchConversations(false, user.id);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [user, isAdmin]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeConversation || !user || isSending) return;

    const tempId = `temp-${Date.now()}`;
    
    try {
      setIsSending(true);
      
      const tempMessage: Message = {
        id: tempId,
        conversation_id: activeConversation.id,
        sender_type: 'client',
        sender_id: user.id,
        content,
        is_read: false,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);
      setShouldAutoScroll(true);

      setPendingSends(prev => {
        const newMap = new Map(prev);
        newMap.set(tempId, {
          conversationId: activeConversation.id,
          content,
          senderId: user.id,
          senderType: 'client',
          retryCount: 0
        });
        return newMap;
      });

      await sendMessage(activeConversation.id, content, user.id, 'client');
      
      setPendingSends(prev => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem. Tentaremos novamente automaticamente.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  }, [activeConversation, user, isSending]);

  // 🎯 ESPECÍFICO CLIENTE: Marcar mensagem como vista (SEM gerenciar contadores locais)
  const markMessageAsViewed = useCallback(async (messageId: string, conversationId: string) => {
    if (markingAsViewed.has(messageId)) {
      return;
    }

    console.log('🎯 CLIENT: markMessageAsViewed chamado para mensagem:', messageId);
    
    setMarkingAsViewed(prev => new Set(prev).add(messageId));
    
    try {
      // 🎯 ESPECÍFICO CLIENTE: Usar markConversationMessagesAsRead
      await markConversationMessagesAsRead(conversationId, 'admin');
      console.log('✅ CLIENT: Mensagem marcada como lida no banco');
    } catch (error) {
      console.error('Error marking message as read:', error);
    } finally {
      setTimeout(() => {
        setMarkingAsViewed(prev => {
          const newSet = new Set(prev);
          newSet.delete(messageId);
          return newSet;
        });
      }, 1000);
    }
  }, [markingAsViewed]);

  // 🎯 ESPECÍFICO CLIENTE: Marcar várias mensagens como vistas (SEM gerenciar contadores locais)
  const markMessagesAsViewed = useCallback(async (messageIds: string[], conversationId: string) => {
    if (messageIds.length === 0) return;
    
    console.log('🎯 CLIENT: markMessagesAsViewed chamado para:', messageIds.length, 'mensagens');
    
    try {
      await markConversationMessagesAsRead(conversationId, 'admin');
      console.log('✅ CLIENT: Mensagens marcadas como lidas no banco');
    } catch (error) {
      console.error('Error marking multiple messages as read:', error);
    }
  }, []);

  const registerScrollContainer = useCallback((container: HTMLDivElement | null) => {
    setScrollContainerRef(container);
  }, []);

  const resetScrollState = useCallback(() => {
    setShouldAutoScroll(true);
    setIsViewingOldMessages(false);
  }, []);

  const enhancedHandleSelectConversation = useCallback(async (conversation: Conversation) => {
    setActiveConversation(conversation);
    resetScrollState();
    await loadMessages(conversation.id);
  }, [loadMessages, resetScrollState]);

  // Subscribe to messages for active conversation
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }
    
    const channel = subscribeToMessages(activeConversation.id, (newMessage) => {
      setMessages(prev => {
        const exists = prev.find(msg => msg.id === newMessage.id);
        if (!exists) {
          const tempMessageIndex = prev.findIndex(msg => 
            msg.id.startsWith('temp-') && 
            msg.sender_id === newMessage.sender_id &&
            msg.content === newMessage.content &&
            Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 5000
          );
          
          if (tempMessageIndex >= 0) {
            const updated = [...prev];
            updated[tempMessageIndex] = newMessage;
            return updated;
          } else {
            // 🎯 ESPECÍFICO CLIENTE: Lógica simplificada - só autoscroll
            if (!isViewingOldMessagesRef.current) {
              setShouldAutoScroll(true);
            }
            return [...prev, newMessage];
          }
        }
        return prev;
      });
      
      // Atualizar conversation updated_at
      setConversations(prev => {
        const updated = [...prev];
        const convIndex = updated.findIndex(c => c.id === activeConversation.id);
        if (convIndex >= 0) {
          updated[convIndex] = {
            ...updated[convIndex],
            updated_at: newMessage.created_at
          };
          
          if (convIndex > 0) {
            const [conv] = updated.splice(convIndex, 1);
            updated.unshift(conv);
          }
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

  // Subscribe to conversations (for client)
  useEffect(() => {
    if (!user || isAdmin) return;

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
        (payload) => {
          const newConversation = payload.new as Conversation;
          setConversations(prev => [newConversation, ...prev]);
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
        (payload) => {
          const updatedConversation = payload.new as Conversation;
          setConversations(prev => {
            const index = prev.findIndex(c => c.id === updatedConversation.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = { ...updated[index], ...updatedConversation };
              return updated;
            }
            return prev;
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  useEffect(() => {
    if (user && !isAdmin) {
      loadConversations();
    }
  }, [user, isAdmin, loadConversations]);

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
    handleSelectConversation: enhancedHandleSelectConversation,
    markMessageAsViewed,
    markMessagesAsViewed,
    setViewingOldMessages: setIsViewingOldMessages,
    resetScrollState,
    isViewingOldMessages,
    registerScrollContainer,
  };
}; 