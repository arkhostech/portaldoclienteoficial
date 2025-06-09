import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Message, Conversation } from './types';
import { chatCache } from '@/utils/cache';

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
        process_type_id,
        process_type:process_type_id (
          name
        )
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
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }

  return data;
};

// Fetch messages for a specific conversation with pagination
export const fetchMessages = async (
  conversationId: string, 
  limit: number = 20, 
  before?: string
): Promise<Message[]> => {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false }) // Ordem decrescente para pegar as mais recentes
    .limit(limit);

  // Se temos um 'before', buscamos mensagens anteriores a essa data
  if (before) {
    query = query.lt('created_at', before);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  // Retorna em ordem crescente (mais antiga para mais nova)
  return (data || []).reverse();
};

// Fetch initial messages (últimas 20)
export const fetchInitialMessages = async (conversationId: string): Promise<Message[]> => {
  return fetchMessages(conversationId, 20);
};

// Fetch older messages (20 anteriores a uma data específica)
export const fetchOlderMessages = async (conversationId: string, beforeDate: string): Promise<Message[]> => {
  return fetchMessages(conversationId, 20, beforeDate);
};

// Send a message
export const sendMessage = async (
  conversationId: string, 
  content: string, 
  senderId: string, 
  senderType: 'admin' | 'client'
): Promise<Message> => {
  const startTime = performance.now();
  console.log('📤 Iniciando envio de mensagem:', { conversationId, senderType, contentLength: content.length });

  try {
    const now = new Date().toISOString();
    
    // Executar ambas operações em paralelo usando Promise.all
    const [conversationResult, messageResult] = await Promise.all([
      supabase
        .from('conversations')
        .update({ updated_at: now })
        .eq('id', conversationId),
      supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            content,
            sender_id: senderId,
            sender_type: senderType,
            is_read: false,
            created_at: now
          }
        ])
        .select()
        .single()
    ]);

    if (conversationResult.error) {
      console.error('Error updating conversation:', conversationResult.error);
      // Não falhar se a atualização da conversa falhar - não é crítico
    }

    if (messageResult.error) {
      console.error('Error sending message:', messageResult.error);
      throw messageResult.error;
    }

    const duration = performance.now() - startTime;
    console.log(`✅ Mensagem enviada com sucesso em ${duration.toFixed(2)}ms`);

    // Invalidar cache de forma assíncrona
    setTimeout(() => {
      chatCache.invalidateConversation(conversationId);
      // Limpar cache das conversações
      const cacheKey = `conversations_${senderId}`;
      chatCache.delete(cacheKey);
    }, 0);

    return messageResult.data;

  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ Erro ao enviar mensagem após ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
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
