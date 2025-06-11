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
  subscribeToMessages
} from '@/services/messages';
import { chatCache } from '@/utils/cache';
import { Conversation, Message } from '@/services/messages/types';
import { useNotifications } from '@/contexts/NotificationContext';

export const useChatClient = () => {
  const { user, isAdmin } = useAuth();
  const { markAsRead, hasNotification } = useNotifications();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messageChannel, setMessageChannel] = useState<RealtimeChannel | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  const [isViewingOldMessages, setIsViewingOldMessages] = useState(false);
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null);
  
  const isViewingOldMessagesRef = useRef(isViewingOldMessages);
  const messagesRef = useRef<Message[]>(messages);
  const scrollContainerRefRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    isViewingOldMessagesRef.current = isViewingOldMessages;
  }, [isViewingOldMessages]);
  
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  
  useEffect(() => {
    scrollContainerRefRef.current = scrollContainerRef;
  }, [scrollContainerRef]);

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
    try {
      setIsLoading(true);
      setHasMoreMessages(true);
      const messagesData = await fetchInitialMessages(conversationId);
      setMessages(messagesData || []);
      setShouldAutoScroll(true);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadOlderMessages = useCallback(async () => {
    if (!activeConversation || loadingOlder || !hasMoreMessages) return;

    try {
      setLoadingOlder(true);
      
      // Usar ref para obter mensagens atuais sem adicionar como dependência
      const currentMessages = messagesRef.current;
      const oldestMessage = currentMessages[0];
      if (!oldestMessage) return;

      const olderMessages = await fetchOlderMessages(
        activeConversation.id,
        oldestMessage.created_at!
      );

      if (olderMessages && olderMessages.length > 0) {
        setMessages(prev => [...olderMessages, ...prev]);
        setIsViewingOldMessages(true);
        setShouldAutoScroll(false);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setLoadingOlder(false);
    }
  }, [activeConversation, loadingOlder, hasMoreMessages]);

  const loadConversations = useCallback(async () => {
    if (!user || isAdmin) return;

    // Cache check - avoid multiple calls
    const cacheKey = `conversations_${user.id}`;
    const cached = chatCache.get<Conversation[]>(cacheKey);
    if (cached) {
      setConversations(cached);
      return;
    }

    try {
      setIsLoading(true);
      const conversationsData = await fetchConversations(false, user.id);
      setConversations(conversationsData || []);
      
      // Cache the result
      chatCache.set(cacheKey, conversationsData || [], 30000);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || !activeConversation || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(activeConversation.id, content, user.id, 'client');
      setShouldAutoScroll(true);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  }, [user, activeConversation, isSending]);

  const registerScrollContainer = useCallback((container: HTMLDivElement | null) => {
    setScrollContainerRef(container);
  }, []);

  const resetScrollState = useCallback(() => {
    setIsViewingOldMessages(false);
    isViewingOldMessagesRef.current = false;
    setShouldAutoScroll(true);
  }, []);

  const enhancedHandleSelectConversation = useCallback(async (conversation: Conversation) => {
    setActiveConversation(conversation);
    setMessages([]);
    resetScrollState();
    await loadMessages(conversation.id);
  }, [loadMessages, resetScrollState]);

  const handleMarkAsRead = useCallback(() => {
    if (activeConversation) {
      markAsRead(activeConversation.id);
    }
  }, [activeConversation, markAsRead]);

  // Start a new conversation for client
  const handleStartNewConversation = useCallback(async () => {
    if (!user || isAdmin) return;
    
    try {
      setIsLoading(true);
      
      // Check if conversation already exists for this client
      const existingConversation = conversations.find(conv => conv.client_id === user.id);
      if (existingConversation) {
        setActiveConversation(existingConversation);
        resetScrollState();
        await loadMessages(existingConversation.id);
        return;
      }
      
      // Create new conversation for the client
      const newConversation = await createConversation(user.id, null);
      
      // Add the new conversation to the list
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setMessages([]);
      resetScrollState();
      
      // Invalidar cache
      const cacheKey = `conversations_${user.id}`;
      chatCache.delete(cacheKey);
    } catch (error) {
      console.error('Error starting new conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin, conversations, loadMessages, resetScrollState]);

  // Subscribe to messages for active conversation only
  useEffect(() => {
    if (!activeConversation) {
      if (messageChannel) {
        supabase.removeChannel(messageChannel);
        setMessageChannel(null);
      }
      return;
    }

    const channel = subscribeToMessages(activeConversation.id, (newMessage) => {
      setMessages(prev => {
        const exists = prev.find(m => m.id === newMessage.id);
        if (!exists) {
          // Auto scroll para mensagens do próprio usuário
          if (newMessage.sender_id === user?.id) {
            setShouldAutoScroll(true);
          } else {
            // Para mensagens de outros, só auto scroll se não estiver vendo antigas
            if (!isViewingOldMessagesRef.current) {
              setShouldAutoScroll(true);
            }
          }
          return [...prev, newMessage];
        }
        return prev;
      });

      // Atualizar conversation updated_at para mover para o topo
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
  }, [activeConversation, user]);

  // Event listeners para conversas vindas do CentralizedRealtimeProvider
  useEffect(() => {
    if (!user || isAdmin) return;

    const handleConversationInserted = (event: CustomEvent) => {
      const conversation = event.detail.conversation;
      setConversations(prev => [conversation, ...prev]);
      
      // Invalidar cache
      const cacheKey = `conversations_${user.id}`;
      chatCache.delete(cacheKey);
    };

    const handleConversationUpdated = (event: CustomEvent) => {
      const conversation = event.detail.conversation;
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === conversation.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...conversation };
          return updated;
        }
        return prev;
      });
      
      // Invalidar cache
      const cacheKey = `conversations_${user.id}`;
      chatCache.delete(cacheKey);
    };

    window.addEventListener('client-conversation-inserted', handleConversationInserted as EventListener);
    window.addEventListener('client-conversation-updated', handleConversationUpdated as EventListener);

    return () => {
      window.removeEventListener('client-conversation-inserted', handleConversationInserted as EventListener);
      window.removeEventListener('client-conversation-updated', handleConversationUpdated as EventListener);
    };
  }, [user, isAdmin]);

  // Load conversations when component mounts
  useEffect(() => {
    if (user && !isAdmin) {
      loadConversations();
    }
  }, [user, isAdmin, loadConversations]);

  // Auto-select first conversation when conversations are loaded
  useEffect(() => {
    if (conversations.length > 0 && !activeConversation) {
      enhancedHandleSelectConversation(conversations[0]);
    }
  }, [conversations.length, activeConversation?.id, enhancedHandleSelectConversation]);

  // Garantir autoscroll quando mensagens são carregadas
  useEffect(() => {
    if (activeConversation && messages.length > 0 && !isLoading && !isViewingOldMessages) {
      setShouldAutoScroll(true);
    }
  }, [activeConversation?.id, messages.length, isLoading, isViewingOldMessages]);

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSending,
    hasMoreMessages,
    loadingOlder,
    shouldAutoScroll,
    isViewingOldMessages,
    scrollContainerRef: registerScrollContainer,
    loadConversations,
    loadMessages,
    loadOlderMessages,
    handleSendMessage,
    handleSelectConversation: enhancedHandleSelectConversation,
    resetScrollState,
    setShouldAutoScroll,
    registerScrollContainer,
    setViewingOldMessages: (viewing: boolean) => {
      setIsViewingOldMessages(viewing);
      isViewingOldMessagesRef.current = viewing;
    },
    // Notificações
    hasNotification,
    handleMarkAsRead,
    handleStartNewConversation
  };
}; 