import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchConversations, 
  fetchInitialMessages,
  fetchOlderMessages, 
  sendMessage, 
  createConversation,
  markMessagesAsRead,
  subscribeToMessages,
  subscribeToConversations,
  fetchUnreadCountsByConversation,
  markMultipleMessagesAsRead,
  markConversationMessagesAsRead
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
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState<Set<string>>(new Set());
  const [unreadByConversation, setUnreadByConversation] = useState<Map<string, number>>(new Map());
  
  // **NOVA FUNCIONALIDADE: Controle inteligente de autoscroll**
  const [isViewingOldMessages, setIsViewingOldMessages] = useState(false);
  const [pendingNewMessages, setPendingNewMessages] = useState<Set<string>>(new Set());
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null);
  
  // **FIX: Refs para valores atuais sem causar re-renders**
  const isViewingOldMessagesRef = useRef(isViewingOldMessages);
  const scrollContainerRefRef = useRef<HTMLDivElement | null>(null);
  
  // Atualizar refs quando valores mudam
  useEffect(() => {
    isViewingOldMessagesRef.current = isViewingOldMessages;
  }, [isViewingOldMessages]);
  
  useEffect(() => {
    scrollContainerRefRef.current = scrollContainerRef;
  }, [scrollContainerRef]);

  // Load initial messages for a specific conversation (últimas 20)
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      const data = await fetchInitialMessages(conversationId);
      setMessages(data);
      setHasMoreMessages(data.length === 20); // Se retornou 20, pode ter mais
      
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

  // Load older messages (para scroll infinito)
  const loadOlderMessages = useCallback(async (conversationId: string) => {
    if (!conversationId || !hasMoreMessages || loadingOlder) return;
    
    try {
      setLoadingOlder(true);
      setShouldAutoScroll(false); // Não fazer auto-scroll ao carregar mensagens antigas
      
      const oldestMessage = messages[0];
      if (!oldestMessage) return;
      
      const olderMessages = await fetchOlderMessages(conversationId, oldestMessage.created_at);
      
      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
        return;
      }
      
      // Adiciona as mensagens antigas no início
      setMessages(prev => [...olderMessages, ...prev]);
      setHasMoreMessages(olderMessages.length === 20);
      
    } catch (error) {
      console.error('Error loading older messages:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar mensagens antigas',
        variant: 'destructive'
      });
    } finally {
      setLoadingOlder(false);
      // NÃO resetar auto-scroll automaticamente
      // Será reativado apenas quando nova mensagem chegar ou usuário rolar para baixo
    }
  }, [messages, hasMoreMessages, loadingOlder]);

  // Load all conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await fetchConversations(isAdmin, user.id);
      setConversations(data);
      
      // **OTIMIZAÇÃO: Usar função otimizada para contagem de não lidas**
      if (isAdmin && data.length > 0) {
        try {
          const unreadCountsMap = await fetchUnreadCountsByConversation(isAdmin, user.id);
          setUnreadByConversation(unreadCountsMap);
        } catch (error) {
          console.error('Error loading optimized unread counts:', error);
          // Fallback para o método original em caso de erro
          setUnreadByConversation(new Map());
        }
      }
      
      // Auto-select the first conversation for clients (they only have one)
      if (!isAdmin && data.length > 0 && !activeConversation) {
        setActiveConversation(data[0]);
        await loadMessages(data[0].id);
      }
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
  }, [user, isAdmin, activeConversation, loadMessages]);

  // Send a message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || !activeConversation) return;
    
    const senderType = isAdmin ? 'admin' : 'client';
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    
    // Optimistic update - adicionar mensagem imediatamente na UI
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: activeConversation.id,
      sender_type: senderType,
      sender_id: user.id,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    };
    
    // Adicionar imediatamente na lista
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Reativar auto-scroll quando usuário enviar mensagem
    setShouldAutoScroll(true);
    
    try {
      setIsSending(true);
      
      // Enviar para o servidor
      const sentMessage = await sendMessage(
        activeConversation.id,
        content,
        user.id,
        senderType
      );
      
      // Substituir a mensagem temporária pela real quando chegar via subscription
      // Não fazemos nada aqui - deixamos a subscription handle
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remover a mensagem temporária em caso de erro
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      
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
      const existingConversation = conversations.find(conv => conv.client_id === targetClientId);
      if (existingConversation) {
        setActiveConversation(existingConversation);
        await loadMessages(existingConversation.id);
        return;
      }
      
      // If no existing conversation found locally, check database as well
      const { data: dbConversations } = await supabase
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
        .eq('client_id', targetClientId)
        .limit(1);
        
      if (dbConversations && dbConversations.length > 0) {
        const existingDbConversation = dbConversations[0];
        setActiveConversation(existingDbConversation);
        await loadMessages(existingDbConversation.id);
        // Also add to local state if not present
        setConversations(prev => {
          const exists = prev.find(c => c.id === existingDbConversation.id);
          if (!exists) {
            return [existingDbConversation, ...prev];
          }
          return prev;
        });
        return;
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

  // Placeholder temporário
  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    setActiveConversation(conversation);
    await loadMessages(conversation.id);
  }, [loadMessages]);

  // Placeholder - será definido depois
  const reactivateAutoScroll = useCallback(() => {
    setShouldAutoScroll(true);
  }, []);

  // Marcar mensagem como vista (remove das não lidas) - **OTIMIZADO**
  const markMessageAsViewed = useCallback(async (messageId: string, conversationId: string) => {
    // **OTIMIZAÇÃO: Usar batch update mesmo para uma mensagem**
    try {
      await markMultipleMessagesAsRead([messageId]);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }

    setUnreadMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });

    setUnreadByConversation(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(conversationId) || 0;
      if (current > 0) {
        newMap.set(conversationId, current - 1);
      }
      return newMap;
    });
  }, []);

  // Marcar várias mensagens como vistas - **OTIMIZADO**
  const markMessagesAsViewed = useCallback(async (messageIds: string[], conversationId: string) => {
    // **OTIMIZAÇÃO: Batch update no banco de dados**
    if (messageIds.length > 0) {
      try {
        await markMultipleMessagesAsRead(messageIds);
      } catch (error) {
        console.error('Error marking multiple messages as read:', error);
      }
    }

    setUnreadMessages(prev => {
      const newSet = new Set(prev);
      messageIds.forEach(id => newSet.delete(id));
      return newSet;
    });

    setUnreadByConversation(prev => {
      const newMap = new Map(prev);
      const currentCount = newMap.get(conversationId) || 0;
      const newCount = Math.max(0, currentCount - messageIds.length);
      newMap.set(conversationId, newCount);
      return newMap;
    });
  }, []);

  // **NOVA FUNCIONALIDADE: Funções de controle inteligente**
  const setViewingOldMessages = useCallback((viewing: boolean) => {
    setIsViewingOldMessages(viewing);
  }, []);

  // **NOVA: Registrar referência do container de scroll**
  const registerScrollContainer = useCallback((container: HTMLDivElement | null) => {
    setScrollContainerRef(container);
  }, []);

  // **NOVA: Effect para detectar scroll diretamente no hook**
  useEffect(() => {
    if (!scrollContainerRef || !activeConversation) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Se está a mais de 200px do final, está vendo mensagens antigas
      const isViewingOld = distanceFromBottom > 200;
      
      console.log('🎯 HOOK - Scroll detectado:', { 
        distanceFromBottom, 
        isViewingOld, 
        scrollTop, 
        scrollHeight, 
        clientHeight,
        activeConversationId: activeConversation.id,
        hasPendingMessages: pendingNewMessages.size > 0
      });
      
      setIsViewingOldMessages(isViewingOld);
      
      // **NOVA FUNCIONALIDADE: Auto-limpar mensagens pendentes quando chega ao final**
      if (!isViewingOld && pendingNewMessages.size > 0) {
        console.log('🧹 Chegou ao final - limpando mensagens pendentes automaticamente');
        
        // Limpar mensagens pendentes
        const messageIds = Array.from(pendingNewMessages);
        setPendingNewMessages(new Set());
        
        // Marcar mensagens pendentes como vistas
        if (activeConversation) {
          markMessagesAsViewed(messageIds, activeConversation.id);
        }
        
        // Reativar autoscroll
        setShouldAutoScroll(true);
      }
    };

    scrollContainerRef.addEventListener('scroll', handleScroll);
    
    // Verificar estado inicial
    handleScroll();

    return () => {
      scrollContainerRef.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainerRef, activeConversation, pendingNewMessages, markMessagesAsViewed]);

  const resetScrollState = useCallback(() => {
    setShouldAutoScroll(true);
    setIsViewingOldMessages(false);
    setPendingNewMessages(new Set());
  }, []);

  // **NOVA: Versão melhorada do reactivateAutoScroll**
  const enhancedReactivateAutoScroll = useCallback(() => {
    setShouldAutoScroll(true);
    setIsViewingOldMessages(false);
    
    // Limpar mensagens pendentes quando usuário rola para baixo
    if (activeConversation && pendingNewMessages.size > 0) {
      setPendingNewMessages(new Set());
      
      // Marcar mensagens pendentes como vistas
      const messageIds = Array.from(pendingNewMessages);
      markMessagesAsViewed(messageIds, activeConversation.id);
    }
  }, [activeConversation, pendingNewMessages, markMessagesAsViewed]);

  // Verificar se tem mensagens não lidas
  const hasUnreadMessages = unreadMessages.size > 0;
  const getUnreadCount = useCallback((conversationId: string) => {
    return unreadByConversation.get(conversationId) || 0;
  }, [unreadByConversation]);

  // **NOVA: Contador que inclui mensagens pendentes para conversa ativa**
  const getUnreadCountWithPending = useCallback((conversationId: string) => {
    const regularUnread = unreadByConversation.get(conversationId) || 0;
    const pendingCount = activeConversation?.id === conversationId ? pendingNewMessages.size : 0;
    return regularUnread + pendingCount;
  }, [unreadByConversation, activeConversation, pendingNewMessages]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to conversations based on user type
    if (isAdmin) {
      // Admin subscribes to all conversations
      const channel = subscribeToConversations((updatedConversation) => {
        // Update the conversation list
        setConversations(prev => {
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
    } else {
      // Client subscribes to conversations where they are the client_id
      const channel = supabase
        .channel('client_conversations')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'conversations',
            filter: `client_id=eq.${user.id}`
          },
          async (payload) => {
            // Fetch the conversation with client data
            const { data } = await supabase
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
              .eq('id', payload.new.id)
              .single();
              
            if (data) {
              setConversations(prev => [data, ...prev]);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
            filter: `client_id=eq.${user.id}`
          },
          async (payload) => {
            // Update existing conversation
            const { data } = await supabase
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
              .eq('id', payload.new.id)
              .single();
              
            if (data) {
              setConversations(prev => {
                const index = prev.findIndex(c => c.id === data.id);
                if (index >= 0) {
                  const updated = [...prev];
                  updated[index] = { ...updated[index], ...data };
                  return updated;
                } else {
                  return [data, ...prev];
                }
              });
            }
          }
        )
        .subscribe();
        
      setConversationChannel(channel);
    }

    // Load initial conversations
    loadConversations();

    return () => {
      // Cleanup subscription
      if (conversationChannel) {
        supabase.removeChannel(conversationChannel);
      }
    };
  }, [user, isAdmin, loadConversations]);

  // Subscription global para todas as mensagens de clientes (apenas para admin)
  useEffect(() => {
    if (!user || !isAdmin) return;

    const channel = supabase
      .channel('admin_all_client_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'sender_type=eq.client'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Só processar se não for uma mensagem da conversa ativa
          // (pois essas já são tratadas pela subscription específica)
          if (!activeConversation || newMessage.conversation_id !== activeConversation.id) {
            // Adicionar às mensagens não lidas
            setUnreadMessages(prevUnread => {
              const newSet = new Set(prevUnread);
              newSet.add(newMessage.id);
              return newSet;
            });

            // Incrementar contador da conversa específica
            setUnreadByConversation(prevMap => {
              const newMap = new Map(prevMap);
              const current = newMap.get(newMessage.conversation_id) || 0;
              newMap.set(newMessage.conversation_id, current + 1);
              return newMap;
            });

            // **NOVA FUNCIONALIDADE: Mover conversa para o topo automaticamente**
            setConversations(prevConversations => {
              const updated = [...prevConversations];
              const convIndex = updated.findIndex(c => c.id === newMessage.conversation_id);
              
              if (convIndex >= 0) {
                // Atualizar updated_at da conversa
                updated[convIndex] = {
                  ...updated[convIndex],
                  updated_at: newMessage.created_at
                };
                
                // Mover para o topo da lista (só se não estiver já no topo)
                if (convIndex > 0) {
                  const [conv] = updated.splice(convIndex, 1);
                  updated.unshift(conv);
                }
              }
              
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, activeConversation]);

  // Subscribe to messages for active conversation
  useEffect(() => {
    if (!activeConversation) {
      // Clear messages when no active conversation
      setMessages([]);
      return;
    }
    
    const channel = subscribeToMessages(activeConversation.id, (newMessage) => {
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.find(msg => msg.id === newMessage.id);
        if (!exists) {
          // Verificar se há mensagem temporária do mesmo usuário para substituir
          const tempMessageIndex = prev.findIndex(msg => 
            msg.id.startsWith('temp-') && 
            msg.sender_id === newMessage.sender_id &&
            msg.content === newMessage.content &&
            Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 5000 // 5 segundos de diferença
          );
          
          if (tempMessageIndex >= 0) {
            // Substituir mensagem temporária pela real
            const updated = [...prev];
            updated[tempMessageIndex] = newMessage;
            return updated;
          } else {
            // **NOVA LÓGICA: Controle inteligente para mensagens de cliente**
            if (isAdmin && newMessage.sender_type === 'client') {
              // **FIX: Usar refs para verificação sem quebrar subscription**
              const currentScrollRef = scrollContainerRefRef.current;
              const isCurrentlyViewingOld = currentScrollRef ? (() => {
                const { scrollTop, scrollHeight, clientHeight } = currentScrollRef;
                const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
                const viewing = distanceFromBottom > 200;
                console.log('🔍 Verificação síncrona de scroll:', { 
                  scrollTop, 
                  scrollHeight, 
                  clientHeight, 
                  distanceFromBottom, 
                  viewing,
                  hasScrollRef: !!currentScrollRef
                });
                return viewing;
              })() : isViewingOldMessagesRef.current;
              
              console.log('🔍 Nova mensagem de cliente:', { 
                messageId: newMessage.id, 
                isViewingOldMessages: isViewingOldMessagesRef.current,
                isCurrentlyViewingOld,
                conversationId: newMessage.conversation_id,
                scrollContainerExists: !!currentScrollRef
              });
              
              // Se usuário está vendo mensagens antigas, não fazer autoscroll
              if (isCurrentlyViewingOld) {
                console.log('📜 Usuário vendo antigas - adicionando às pendentes');
                // Adicionar às mensagens pendentes (só mostra notificação)
                setPendingNewMessages(prevPending => {
                  const newSet = new Set(prevPending);
                  newSet.add(newMessage.id);
                  console.log('📝 Pendentes atualizadas:', newSet.size);
                  return newSet;
                });
                
                // Atualizar state para ficar sincronizado
                setIsViewingOldMessages(true);
                
                // NÃO reativar autoscroll nem marcar como não lida nos contadores gerais
              } else {
                console.log('👁️ Usuário no final - comportamento normal');
                // Comportamento normal: marcar como não lida e fazer autoscroll
                setUnreadMessages(prevUnread => {
                  const newSet = new Set(prevUnread);
                  newSet.add(newMessage.id);
                  return newSet;
                });

                setUnreadByConversation(prevMap => {
                  const newMap = new Map(prevMap);
                  const current = newMap.get(activeConversation.id) || 0;
                  newMap.set(activeConversation.id, current + 1);
                  return newMap;
                });
                
                // Reativar auto-scroll quando nova mensagem chegar
                setShouldAutoScroll(true);
              }
            } else {
              // Para mensagens do admin, só fazer autoscroll se não estiver vendo antigas
              console.log('💼 Mensagem do admin:', { 
                messageId: newMessage.id, 
                isViewingOld: isViewingOldMessagesRef.current,
                willAutoScroll: !isViewingOldMessagesRef.current
              });
              
              if (!isViewingOldMessagesRef.current) {
                setShouldAutoScroll(true);
              }
            }

            return [...prev, newMessage];
          }
        }
        return prev;
      });
      
      // **MELHORADO: Update conversation updated_at to move it to top of list**
      setConversations(prev => {
        const updated = [...prev];
        const convIndex = updated.findIndex(c => c.id === activeConversation.id);
        if (convIndex >= 0) {
          // Atualizar updated_at da conversa
          updated[convIndex] = {
            ...updated[convIndex],
            updated_at: newMessage.created_at
          };
          
          // Mover para o topo apenas se não estiver já no topo
          if (convIndex > 0) {
            const [conv] = updated.splice(convIndex, 1);
            updated.unshift(conv);
          }
        }
        return updated;
      });
    });
    
    setMessageChannel(channel);
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [activeConversation]);

  // **FUNCIONALIDADE MELHORADA: Redefinir handleSelectConversation**
  const enhancedHandleSelectConversation = useCallback(async (conversation: Conversation) => {
    setActiveConversation(conversation);
    resetScrollState(); // Resetar estado de scroll ao trocar conversa
    await loadMessages(conversation.id);
  }, [loadMessages, resetScrollState]);

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSending,
    hasMoreMessages,
    loadingOlder,
    shouldAutoScroll,
    loadConversations,
    loadMessages,
    loadOlderMessages,
    handleSendMessage,
    handleStartConversation,
    handleSelectConversation: enhancedHandleSelectConversation,
    reactivateAutoScroll: enhancedReactivateAutoScroll,
    markMessageAsViewed,
    markMessagesAsViewed,
    hasUnreadMessages,
    getUnreadCount,
    getUnreadCountWithPending,
    // **NOVAS FUNCIONALIDADES**
    setViewingOldMessages,
    resetScrollState,
    isViewingOldMessages,
    pendingNewMessages: pendingNewMessages.size,
    registerScrollContainer,
  };
};
