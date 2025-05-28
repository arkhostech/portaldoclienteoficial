import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'client' | 'admin';
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  client_id: string;
  created_at: string;
  messages?: Message[];
}

interface UseChatReturn {
  conversations: Conversation[];
  messages: Message[];
  loading: boolean;
  selectedConversation: string | null;
  setSelectedConversation: (conversationId: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshMessages: () => Promise<void>;
}

export const useChat = (): UseChatReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Erro ao carregar as conversas.");
      }

      setConversations(data || []);
    } catch (error) {
      console.error("Unexpected error fetching conversations:", error);
      toast.error("Erro inesperado ao carregar as conversas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string | null) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        toast.error("Erro ao carregar as mensagens.");
      }

      setMessages(data || []);
    } catch (error) {
      console.error("Unexpected error fetching messages:", error);
      toast.error("Erro inesperado ao carregar as mensagens.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !selectedConversation) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: selectedConversation,
          sender_id: user.id,
          sender_type: 'client',
          content: content,
          is_read: false
        }]);

      if (error) {
        console.error("Error sending message:", error);
        toast.error("Erro ao enviar a mensagem.");
      } else {
        // Optimistically update the local state
        const newMessage: Message = {
          id: 'temp_' + Date.now(), // Temporary ID
          conversation_id: selectedConversation,
          sender_id: user.id,
          sender_type: 'client',
          content: content,
          created_at: new Date().toISOString(),
          is_read: false,
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Refresh messages to get the actual ID from the database
        await fetchMessages(selectedConversation);
      }
    } catch (error) {
      console.error("Unexpected error sending message:", error);
      toast.error("Erro inesperado ao enviar a mensagem.");
    }
  };

  const markAllAsRead = async () => {
    if (!selectedConversation) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', selectedConversation)
        .eq('sender_type', 'admin');

      if (error) {
        console.error("Error marking messages as read:", error);
        toast.error("Erro ao marcar mensagens como lidas.");
      } else {
        // Update local state
        setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })));
      }
    } catch (error) {
      console.error("Unexpected error marking messages as read:", error);
      toast.error("Erro inesperado ao marcar mensagens como lidas.");
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return {
    conversations,
    messages,
    loading,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    markAllAsRead,
    markMessageAsRead,
    refreshConversations: fetchConversations,
    refreshMessages: fetchMessages
  };
};
