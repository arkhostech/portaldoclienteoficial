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
    
    try {
      setIsSending(true);
      const senderType = isAdmin ? 'admin' : 'client';
      
      // Reativar auto-scroll quando usuário enviar mensagem
      setShouldAutoScroll(true);
      
      await sendMessage(
        activeConversation.id,
        content,
        user.id,
        senderType
      );
      
      // Don't update local state - let the subscription handle it
      // This avoids duplicate messages
    } catch (error) {
      console.error('Error sending message:', error);
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
          // Reativar auto-scroll quando nova mensagem chegar
          setShouldAutoScroll(true);
          return [...prev, newMessage];
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
  };
};
