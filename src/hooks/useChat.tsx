
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  startConversation,
  markMessagesAsRead
} from "@/services/messages";
import { debounce } from "lodash";

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'admin' | 'client';
  sender_id: string;
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  client_id: string;
  client?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    status: string;
  };
  process_type?: string;
}

export const useChat = () => {
  const { user, isAdmin } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Debounced function to mark messages as read
  const debouncedMarkAsRead = useCallback(
    debounce((conversationId: string) => {
      if (conversationId) {
        markMessagesAsRead(conversationId, isAdmin ? 'client' : 'admin').catch((error) => {
          console.error("Error marking messages as read:", error);
        });
      }
    }, 500),
    [isAdmin]
  );

  // Fetch conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const conversationsData = await fetchConversations(user.id, isAdmin);
      setConversations(conversationsData);
      
      // Auto-select first conversation if none is active
      if (conversationsData.length > 0 && !activeConversation) {
        handleSelectConversation(conversationsData[0]);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Erro ao carregar conversas");
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin, activeConversation]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const messagesData = await fetchMessages(conversationId);
      setMessages(messagesData);
      
      // Mark messages as read
      debouncedMarkAsRead(conversationId);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Erro ao carregar mensagens");
    }
  }, [debouncedMarkAsRead]);

  // Handle selecting a conversation
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
    loadMessages(conversation.id);
  }, [loadMessages]);

  // Send a message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || !activeConversation || !content.trim()) return;
    
    setIsSending(true);
    try {
      const senderType = isAdmin ? 'admin' : 'client';
      const newMessage = await sendMessage({
        conversation_id: activeConversation.id,
        sender_type: senderType,
        sender_id: user.id,
        content: content.trim(),
      });
      
      // Add the new message to the list
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  }, [user, activeConversation, isAdmin]);

  // Start a new conversation
  const handleStartConversation = useCallback(async (clientId: string, processType?: string) => {
    if (!user) return;
    
    try {
      const conversation = await startConversation(clientId, processType);
      setConversations(prev => [conversation, ...prev]);
      setActiveConversation(conversation);
      return conversation;
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Erro ao iniciar conversa");
      return null;
    }
  }, [user]);

  // Subscribe to realtime updates for new messages
  useEffect(() => {
    if (!activeConversation) return;
    
    const channel = supabase
      .channel(`messages-${activeConversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConversation.id}`,
      }, (payload) => {
        const newMessage = payload.new as Message;
        
        // Only add if not from current user to avoid duplicates
        if (newMessage.sender_id !== user?.id) {
          setMessages(prev => [...prev, newMessage]);
          
          // Mark as read if we're looking at the conversation
          debouncedMarkAsRead(activeConversation.id);
        }
      })
      .subscribe();
    
    // Load initial messages
    loadMessages(activeConversation.id);
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, user, loadMessages, debouncedMarkAsRead]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
    
    // Set up subscription for new conversations
    if (user) {
      const channel = supabase
        .channel('new-conversations')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: isAdmin ? undefined : `client_id=eq.${user.id}`,
        }, () => {
          loadConversations();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isAdmin, loadConversations]);

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSending,
    handleSendMessage,
    handleSelectConversation,
    handleStartConversation,
    loadConversations,
  };
};

// Para o uso do supabase, adicione esta linha no início do arquivo
import { supabase } from "@/integrations/supabase/client";
