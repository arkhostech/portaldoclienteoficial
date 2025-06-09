import { useState, useEffect, useRef, useLayoutEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth";
import { useChatClient } from "@/hooks/useChatClient";
import { useNotifications } from "@/contexts/NotificationContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { Send, PaperclipIcon, Loader2, Check } from "lucide-react";
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
    setViewingOldMessages,
    isViewingOldMessages,
    registerScrollContainer,
    handleSelectConversation,
    handleMarkAsRead,
  } = useChatClient();
  
  const { hasNotification, markAsRead } = useNotifications();

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Registrar o container de scroll
  useEffect(() => {
    registerScrollContainer(messagesContainerRef.current);
  }, [registerScrollContainer]);

  // Auto-scroll quando shouldAutoScroll está ativo
  useLayoutEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current && messages.length > 0 && !isLoading) {
      // Aplicar scroll imediatamente de forma síncrona
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
    }
  }, [shouldAutoScroll, messages.length, isLoading]);

  return (
    <MainLayout title="Mensagens">
      <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Mensagens</h1>
          {activeConversation && (
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Conversa com suporte
              </div>
              {hasNotification(activeConversation.id) && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleMarkAsRead}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                >
                  <Check className="h-3 w-3" />
                  Marcar como lida
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto border rounded-lg p-4 bg-background mb-4"
        >
          <div className="min-h-full">
            {loadingOlder && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-2">
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
            ) : !activeConversation ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <p className="mb-2">Você ainda não tem conversas ativas.</p>
                  <p className="text-sm">Entre em contato conosco através dos outros canais de atendimento.</p>
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
        <div className="flex-shrink-0">
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
              className="flex-1 min-h-[120px] max-h-[200px] resize-none"
              rows={5}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || !activeConversation || isSending}
              size="icon"
              className="h-[120px] w-[44px]"
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
