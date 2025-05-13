
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchConversations, 
  fetchMessages, 
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

  // Load all conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await fetchConversations(isAdmin, user.id);
      setConversations(data);
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
  }, [user, isAdmin]);

  // Load messages for a specific conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      const data = await fetchMessages(conversationId);
      setMessages(data);
      
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

  // Send a message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || !activeConversation) return;
    
    try {
      setIsSending(true);
      const senderType = isAdmin ? 'admin' : 'client';
      
      const newMessage = await sendMessage(
        activeConversation.id,
        content,
        user.id,
        senderType
      );
      
      // Update local messages state to avoid waiting for subscription
      setMessages(prev => [...prev, newMessage]);
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
      if (!isAdmin) {
        const existingConversation = conversations.find(conv => conv.client_id === user.id);
        if (existingConversation) {
          setActiveConversation(existingConversation);
          await loadMessages(existingConversation.id);
          return;
        }
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

  // Setup realtime subscriptions - Fix: Updated to avoid re-subscribing on every render
  useEffect(() => {
    if (!user) return;
    
    // Clean up any existing channels first
    if (conversationChannel) {
      supabase.removeChannel(conversationChannel);
    }

    // Subscribe to all conversations if admin
    if (isAdmin) {
      const channel = subscribeToConversations((updatedConversation) => {
        // Update the conversation list
        setConversations(prev => {
          // Check if the conversation already exists in state
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
    }

    // Load initial conversations only once when component mounts
    loadConversations();

    // Cleanup function
    return () => {
      if (conversationChannel) {
        supabase.removeChannel(conversationChannel);
      }
    };
  }, [user?.id, isAdmin]); // Fixed: Only depend on user.id and isAdmin, not the entire user object

  // Subscribe to messages for active conversation
  useEffect(() => {
    // Clean up any existing message channel
    if (messageChannel) {
      supabase.removeChannel(messageChannel);
      setMessageChannel(null);
    }
    
    if (!activeConversation) return;
    
    const channel = subscribeToMessages(activeConversation.id, (newMessage) => {
      // Prevent duplicate messages by checking if we already have it
      setMessages(prev => {
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });
    
    setMessageChannel(channel);
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [activeConversation?.id]); // Fixed: Only depend on activeConversation.id

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSending,
    loadConversations,
    loadMessages,
    handleSendMessage,
    handleStartConversation,
    handleSelectConversation,
  };
};
