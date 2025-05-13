
import { supabase } from '@/integrations/supabase/client';

// Count unread messages for a user
export const countUnreadMessages = async (isAdmin: boolean, userId: string): Promise<number> => {
  if (isAdmin) {
    // For admin, count all unread messages sent by clients
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('is_read', false)
      .eq('sender_type', 'client');

    if (error) {
      console.error('Error counting unread messages:', error);
      throw error;
    }

    return count || 0;
  } else {
    // For clients, first get their conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', userId);
      
    if (convError) {
      console.error('Error fetching conversations:', convError);
      throw convError;
    }
    
    if (!conversations || conversations.length === 0) {
      return 0;
    }
    
    // Then count unread messages in those conversations
    const conversationIds = conversations.map(conv => conv.id);
    
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('is_read', false)
      .eq('sender_type', 'admin')
      .in('conversation_id', conversationIds);
      
    if (error) {
      console.error('Error counting unread messages:', error);
      throw error;
    }
    
    return count || 0;
  }
};
