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

export const useChat = (clientId?: string) => {
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
  const scrollContainerRefRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    isViewingOldMessagesRef.current = isViewingOldMessages;
  }, [isViewingOldMessages]);
  
  useEffect(() => {
    scrollContainerRefRef.current = scrollContainerRef;
  }, [scrollContainerRef]);

  // Função para buscar dados completos de uma conversa
  const fetchCompleteConversation = useCallback(async (conversationId: string): Promise<Conversation | null> => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          client:client_id (
            full_name,
            email,
            phone,
            status,
            process_type_id,
            process_type:process_type_id (
              name
            )
          )
        `)
        .eq('id', conversationId)
        .single();

      if (error) {
        console.error('Error fetching complete conversation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching complete conversation:', error);
      return null;
    }
  }, []);

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
      const oldestMessage = messages[0];
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
  }, [activeConversation, messages, loadingOlder, hasMoreMessages]);

  // Send message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || !activeConversation || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(activeConversation.id, content, user.id, isAdmin ? 'admin' : 'client');
      setShouldAutoScroll(true);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  }, [user, activeConversation, isAdmin, isSending]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const conversationsData = await fetchConversations(isAdmin, clientId || user.id);
      setConversations(conversationsData || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin, clientId]);

  const registerScrollContainer = useCallback((container: HTMLDivElement | null) => {
    setScrollContainerRef(container);
  }, []);

  const resetScrollState = useCallback(() => {
    setIsViewingOldMessages(false);
    isViewingOldMessagesRef.current = false;
    setShouldAutoScroll(true);
  }, []);

  // Select conversation
  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
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

  // Start a new conversation
  const handleStartConversation = useCallback(async (targetClientId: string, processType: string | null = null) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Check if conversation already exists for this client
      const existingConversation = conversations.find(conv => conv.client_id === targetClientId);
      if (existingConversation) {
        setActiveConversation(existingConversation);
        resetScrollState();
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
            process_type_id,
            process_type:process_type_id (
              name
            )
          )
        `)
        .eq('client_id', targetClientId)
        .limit(1);
        
      if (dbConversations && dbConversations.length > 0) {
        const existingDbConversation = dbConversations[0];
        setActiveConversation(existingDbConversation);
        resetScrollState();
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
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin, conversations, loadMessages, resetScrollState]);

  const setViewingOldMessages = useCallback((viewing: boolean) => {
    setIsViewingOldMessages(viewing);
    isViewingOldMessagesRef.current = viewing;
  }, []);

  // Subscribe to messages for the active conversation
  useEffect(() => {
    if (!activeConversation || !user) {
      if (messageChannel) {
        supabase.removeChannel(messageChannel);
        setMessageChannel(null);
      }
      return;
    }

    const channel = subscribeToMessages(activeConversation.id, (newMessage: Message) => {
      setMessages(prev => {
        // Evitar duplicação
        if (prev.some(m => m.id === newMessage.id)) {
          return prev;
        }

        // Atualizar auto scroll baseado na origem da mensagem
        if (newMessage.sender_id === user?.id) {
          setShouldAutoScroll(true);
          setIsViewingOldMessages(false);
          isViewingOldMessagesRef.current = false;
        } else {
          const isCurrentlyViewingOld = isViewingOldMessagesRef.current;
          if (!isCurrentlyViewingOld) {
            setShouldAutoScroll(true);
          }
        }

        return [...prev, newMessage];
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
  }, [activeConversation, user, isAdmin]);

  // Event listeners para conversas vindas do CentralizedRealtimeProvider
  useEffect(() => {
    if (!user) return;

    const handleAdminConversationInserted = (event: CustomEvent) => {
      const conversation = event.detail.conversation;
      
      // Verificar se a conversa já existe na lista para evitar duplicatas
      setConversations(prev => {
        const exists = prev.find(c => c.id === conversation.id);
        if (!exists) {
          // Buscar dados completos da conversa de forma assíncrona
          fetchCompleteConversation(conversation.id).then(completeConv => {
            if (completeConv) {
              setConversations(prevConvs => {
                const stillExists = prevConvs.find(c => c.id === conversation.id);
                if (!stillExists) {
                  return [completeConv, ...prevConvs];
                }
                return prevConvs;
              });
            }
          }).catch(error => {
            console.error('Error fetching complete conversation data:', error);
            // Fallback para adicionar a conversa sem dados do cliente
            setConversations(prevConvs => {
              const stillExists = prevConvs.find(c => c.id === conversation.id);
              if (!stillExists) {
                return [conversation, ...prevConvs];
              }
              return prevConvs;
            });
          });
        }
        return prev;
      });
    };

    const handleAdminConversationUpdated = (event: CustomEvent) => {
      const conversation = event.detail.conversation;
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === conversation.id);
        if (index >= 0) {
          const updated = [...prev];
          // Atualizar a conversa com os novos dados
          updated[index] = { ...updated[index], ...conversation };
          
          // Mover para o topo se não estiver já no topo
          if (index > 0) {
            const [updatedConv] = updated.splice(index, 1);
            updated.unshift(updatedConv);
          }
          
          return updated;
        }
        return prev;
      });
    };

    if (isAdmin) {
      window.addEventListener('admin-conversation-inserted', handleAdminConversationInserted as EventListener);
      window.addEventListener('admin-conversation-updated', handleAdminConversationUpdated as EventListener);

      return () => {
        window.removeEventListener('admin-conversation-inserted', handleAdminConversationInserted as EventListener);
        window.removeEventListener('admin-conversation-updated', handleAdminConversationUpdated as EventListener);
      };
    }
  }, [user, isAdmin]);

  // Load conversations when component mounts
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

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
    handleSelectConversation,
    handleStartConversation,
    resetScrollState,
    setShouldAutoScroll,
    registerScrollContainer,
    setViewingOldMessages,
    // Notificações
    hasNotification,
    handleMarkAsRead
  };
};
