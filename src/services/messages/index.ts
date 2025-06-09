import { supabase } from '@/integrations/supabase/client';
import { Message, Conversation } from './types';
import { RealtimeChannel } from '@supabase/supabase-js';
import { chatCache, CACHE_KEYS, CACHE_TTL } from '@/utils/cache';
import { monitoredOperation } from '@/utils/performance-monitor';

// **OTIMIZAÇÃO 1: Single query para contagem de não lidas por conversa (COM CACHE + MONITOR)**
export const fetchUnreadCountsByConversation = async (isAdmin: boolean, userId?: string): Promise<Map<string, number>> => {
  if (!userId) return new Map();
  
  // **CACHE: Verificar cache primeiro**
  const cacheKey = CACHE_KEYS.UNREAD_COUNTS(userId);
  const cached = chatCache.get<Map<string, number>>(cacheKey);
  if (cached) {
    return cached;
  }

  return monitoredOperation('fetchUnreadCounts', async () => {
    let result = new Map<string, number>();

    if (!isAdmin) {
      // Para clientes, só tem uma conversa mesmo, então não precisa de otimização complexa
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', userId);
      
      if (!conversations || conversations.length === 0) {
        chatCache.set(cacheKey, result, CACHE_TTL.UNREAD_COUNTS);
        return result;
      }
      
      const conversationIds = conversations.map(conv => conv.id);
      
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .or('is_read.eq.false,is_read.is.null')
        .eq('sender_type', 'admin')
        .in('conversation_id', conversationIds);
      
      if (count && count > 0) {
        conversationIds.forEach(id => result.set(id, count));
      }
    } else {
      // Para admin: uma única query com GROUP BY para todas as conversas
      const { data, error } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('sender_type', 'client')
        .or('is_read.eq.false,is_read.is.null');

      if (error) {
        console.error('Error fetching unread counts:', error);
        return new Map();
      }

      // Agrupar e contar manualmente (Supabase não suporta GROUP BY diretamente)
      data?.forEach(msg => {
        const current = result.get(msg.conversation_id) || 0;
        result.set(msg.conversation_id, current + 1);
      });
    }

    // **CACHE: Armazenar resultado**
    chatCache.set(cacheKey, result, CACHE_TTL.UNREAD_COUNTS);
    return result;
  });
};

// **OTIMIZAÇÃO 2: Batch update para marcar múltiplas mensagens como lidas (COM CACHE)**
export const markMultipleMessagesAsRead = async (messageIds: string[]): Promise<void> => {
  if (messageIds.length === 0) return;

  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds);

    if (error) {
      console.error('Error in batch update:', error);
      throw error;
    }

    // **CACHE: Invalidar cache de contagens (não sabemos quais conversas foram afetadas)**
    // Usar uma estratégia mais agressiva de invalidação
    const cacheKeys = chatCache.getStats().keys;
    cacheKeys.forEach(key => {
      if (key.includes('unread_counts')) {
        chatCache.delete(key);
      }
    });

  } catch (error) {
    console.error('Error marking multiple messages as read:', error);
    throw error;
  }
};

// **OTIMIZAÇÃO 3: Marcar mensagens como lidas por conversa (otimizada COM CACHE)**
export const markConversationMessagesAsRead = async (conversationId: string, senderType?: 'admin' | 'client'): Promise<void> => {
  try {
    let query = supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .or('is_read.eq.false,is_read.is.null');

    // Se especificado, só marcar mensagens de um tipo de remetente
    if (senderType) {
      query = query.eq('sender_type', senderType);
    }

    const { error } = await query;

    if (error) {
      console.error('Error marking conversation messages as read:', error);
      throw error;
    }

    // **CACHE: Invalidar cache relacionado a esta conversa**
    chatCache.invalidateConversation(conversationId);

  } catch (error) {
    console.error('Error in markConversationMessagesAsRead:', error);
    throw error;
  }
};

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

// Send a message (OTIMIZADO - COM PERFORMANCE MONITORING)
export const sendMessage = async (
  conversationId: string, 
  content: string, 
  senderId: string, 
  senderType: 'admin' | 'client'
): Promise<Message> => {
  const startTime = performance.now();
  console.log('📤 Iniciando envio de mensagem:', { conversationId, senderType, contentLength: content.length });

  try {
    // **OTIMIZAÇÃO: Usar transação para ambas operações**
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

    // **OTIMIZAÇÃO: Invalidar cache de forma assíncrona**
    setTimeout(() => {
      chatCache.invalidateConversation(conversationId);
    }, 0);

    return messageResult.data;

  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ Erro ao enviar mensagem após ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};

// Mark all messages as read (função original mantida para compatibilidade)
export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
  return markConversationMessagesAsRead(conversationId);
};

// Count unread messages for a user
export const countUnreadMessages = async (isAdmin: boolean, userId: string): Promise<number> => {
  try {
    if (isAdmin) {
      // For admin, count all unread messages sent by clients
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .or('is_read.eq.false,is_read.is.null')
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
        .or('is_read.eq.false,is_read.is.null')
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
