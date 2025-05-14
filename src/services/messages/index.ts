
import { supabase } from '@/integrations/supabase/client';
import { Message, Conversation } from './types';
import { RealtimeChannel } from '@supabase/supabase-js';

// Fetch all conversations for admin, or a client's conversations for client
export const fetchConversations = async (isAdmin: boolean, clientId?: string): Promise<Conversation[]> => {
  let query = supabase
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
    .order('updated_at', { ascending: false });
  
  if (!isAdmin && clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  return data || [];
};

// Create a new conversation
export const createConversation = async (clientId: string, processType: string | null): Promise<Conversation> => {
  const { data, error } = await supabase
    .from('conversations')
    .insert([
      { client_id: clientId, process_type: processType }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }

  return data;
};

// Fetch messages for a specific conversation
export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return data || [];
};

// Send a message
export const sendMessage = async (
  conversationId: string, 
  content: string, 
  senderId: string, 
  senderType: 'admin' | 'client'
): Promise<Message> => {
  // Also update the conversation's updated_at time
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conversationId,
        content,
        sender_id: senderId,
        sender_type: senderType
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  return data;
};

// Mark all messages as read
export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Count unread messages for a user
export const countUnreadMessages = async (isAdmin: boolean, userId: string): Promise<number> => {
  let query = supabase
    .from('messages')
    .select('id', { count: 'exact' })
    .eq('is_read', false);

  if (isAdmin) {
    // For admin, count all unread messages sent by clients
    query = query.eq('sender_type', 'client');
  } else {
    // For clients, count unread messages in their conversations sent by admins
    query = query
      .eq('sender_type', 'admin')
      .in('conversation_id', 
        supabase
          .from('conversations')
          .select('id')
          .eq('client_id', userId)
      );
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting unread messages:', error);
    throw error;
  }

  return count || 0;
};

// Subscribe to new messages for a conversation
export const subscribeToMessages = (
  conversationId: string,
  callback: (message: Message) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return channel;
};

// Subscribe to new conversations (for admin)
export const subscribeToConversations = (
  callback: (conversation: Conversation) => void
): RealtimeChannel => {
  const channel = supabase
    .channel('new_conversations')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations'
      },
      (payload) => {
        callback(payload.new as Conversation);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations'
      },
      (payload) => {
        callback(payload.new as Conversation);
      }
    )
    .subscribe();

  return channel;
};
