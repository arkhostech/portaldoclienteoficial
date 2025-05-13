
import { supabase } from '@/integrations/supabase/client';
import { Message } from './types';

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
