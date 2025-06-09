import { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth";
import { useChatClient } from "@/hooks/useChatClient";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Send, PaperclipIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const Messages = () => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSending,
    hasMoreMessages,
    loadingOlder,
    shouldAutoScroll,
    handleSendMessage,
    loadOlderMessages,
    markMessagesAsViewed,
    markMessageAsViewed,
    setViewingOldMessages,
    isViewingOldMessages,
    registerScrollContainer,
    handleSelectConversation,
  } = useChatClient();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSend = async () => {
    if (newMessage.trim() !== "" && user && activeConversation) {
      handleSendMessage(newMessage);
      setNewMessage("");
    }
  };

  // Scroll infinito para carregar mensagens antigas
  useScrollToTop({
    containerRef: messagesContainerRef,
    onScrollToTop: () => {
      if (activeConversation && hasMoreMessages && !loadingOlder) {
        loadOlderMessages();
      }
    },
    threshold: 50,
    enabled: !!activeConversation && hasMoreMessages && !loadingOlder
  });

  // Preserva a posição do scroll quando carrega mensagens antigas
  useScrollPosition({
    containerRef: messagesContainerRef,
    isLoading: loadingOlder,
    dependency: messages.length
  });

  // Controle básico de scroll
  useScrollToBottom({
    containerRef: messagesContainerRef,
    onNearBottom: () => setViewingOldMessages(false),
    threshold: 100,
    enabled: !!activeConversation && !shouldAutoScroll
  });

  // Registrar container para detecção de scroll no hook
  useEffect(() => {
    if (messagesContainerRef.current) {
      registerScrollContainer(messagesContainerRef.current);
    }
    
    return () => {
      registerScrollContainer(null);
    };
  }, [registerScrollContainer, activeConversation]);

  // Intersection Observer para detectar mensagens vistas
  const { observe: observeMessage } = useIntersectionObserver({
    onIntersect: (element) => {
      const messageId = element.getAttribute('data-message-id');
      const conversationId = element.getAttribute('data-conversation-id');
      const senderType = element.getAttribute('data-sender-type');
      
      if (messageId && conversationId && senderType === 'admin') {
        console.log('🎯 Cliente marcando mensagem do admin como vista:', messageId);
        markMessageAsViewed(messageId, conversationId);
      }
    },
    threshold: 0.5,
    enabled: !!activeConversation
  });

  // Auto-scroll to bottom apenas para novas mensagens
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current && shouldAutoScroll && !loadingOlder && !isViewingOldMessages) {
      setTimeout(() => {
        const scrollContainer = messagesContainerRef.current;
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }, 100);
    }
  }, [messages.length, shouldAutoScroll, loadingOlder, isViewingOldMessages]);

  // Selecionar primeira conversa se disponível
  useEffect(() => {
    if (!activeConversation && conversations.length > 0) {
      handleSelectConversation(conversations[0]);
    }
  }, [conversations, activeConversation, handleSelectConversation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <MainLayout title="Mensagens">
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        <div className="mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold">Conversa com Escritório de Advocacia</h2>
          <p className="text-sm text-muted-foreground">
            Todas as mensagens são arquivadas para referência futura
          </p>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            ⏰ As mensagens serão respondidas dentro do horário comercial
          </p>
        </div>

        {/* Messages list with fixed height and internal scroll */}
        <div className="flex-1 border rounded-lg bg-background overflow-hidden">
          <div 
            ref={messagesContainerRef}
            className="h-full overflow-y-auto p-4 relative"
          >
            {/* Loading indicator para mensagens antigas */}
            {loadingOlder && (
              <div className="flex justify-center py-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando mensagens antigas...</span>
                </div>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando mensagens...</span>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>Nenhuma mensagem ainda. Envie uma mensagem para começar a conversa!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    ref={observeMessage}
                    data-message-id={message.id}
                    data-conversation-id={message.conversation_id}
                    data-sender-type={message.sender_type}
                    className={`flex ${
                      message.sender_type === 'client' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.sender_type === 'client'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Message input */}
        <div className="mt-4 flex-shrink-0">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                activeConversation
                  ? "Digite sua mensagem..."
                  : "Aguarde carregar a conversa..."
              }
              onKeyPress={handleKeyPress}
              disabled={!activeConversation || isSending}
              className="flex-1 min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || !activeConversation || isSending}
              size="icon"
              className="h-[44px] w-[44px]"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
