
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from './types';

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
