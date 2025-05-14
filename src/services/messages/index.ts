
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'admin' | 'client';
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  client_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  process_type?: string;
  client?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    status: string;
  };
}

// Function to fetch all conversations for a user
export const fetchConversations = async (userId: string, isAdmin: boolean): Promise<Conversation[]> => {
  try {
    let query = supabase
      .from('conversations')
      .select(`
        *,
        client:client_id (
          id, full_name, email, phone, status
        )
      `)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    
    // For clients, only fetch their own conversations
    if (!isAdmin) {
      query = query.eq('client_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Function to fetch messages for a conversation
export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Function to send a message
export const sendMessage = async (messageData: {
  conversation_id: string;
  sender_type: 'admin' | 'client';
  sender_id: string;
  content: string;
}): Promise<Message> => {
  try {
    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', messageData.conversation_id);
    
    // Insert the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        is_read: false,
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Function to start a conversation
export const startConversation = async (clientId: string, processType?: string): Promise<Conversation> => {
  try {
    // Check if an active conversation already exists
    const { data: existingConversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .limit(1);
    
    if (existingConversations && existingConversations.length > 0) {
      // Update the existing conversation's timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', existingConversations[0].id);
      
      // Return the existing conversation
      return existingConversations[0];
    }
    
    // Create a new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        client_id: clientId,
        process_type: processType,
      })
      .select(`
        *,
        client:client_id (
          id, full_name, email, phone, status
        )
      `)
      .single();
    
    if (error) throw error;
    
    // Send a system welcome message
    await sendMessage({
      conversation_id: data.id,
      sender_type: 'admin',
      sender_id: '00000000-0000-0000-0000-000000000000', // System user ID
      content: 'Bem-vindo(a) ao atendimento. Como podemos ajudar?',
    });
    
    return data;
  } catch (error) {
    console.error('Error starting conversation:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, senderType: 'admin' | 'client'): Promise<void> => {
  try {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('sender_type', senderType);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// Count unread messages for a user
export const countUnreadMessages = async (isAdmin: boolean, userId: string): Promise<number> => {
  try {
    if (isAdmin) {
      // For admin, count all unread messages sent by clients
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('is_read', false)
        .eq('sender_type', 'client');
      
      if (error) throw error;
      return count || 0;
      
    } else {
      // For clients, first get their conversation IDs
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', userId);
      
      if (convError) throw convError;
      if (!conversations || conversations.length === 0) return 0;
      
      // Then count unread messages in those conversations
      const conversationIds = conversations.map(conv => conv.id);
      
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('is_read', false)
        .eq('sender_type', 'admin')
        .in('conversation_id', conversationIds);
      
      if (error) throw error;
      return count || 0;
    }
  } catch (error) {
    console.error('Error counting unread messages:', error);
    throw error;
  }
};
