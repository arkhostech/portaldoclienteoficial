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
import { Send, PaperclipIcon, Loader2, Check, Headphones } from "lucide-react";
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
        {/* Header do Chat */}
        <div className="bg-[#14140F] rounded-t-lg px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#A3CCAB] rounded-lg">
              <Headphones className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Mensagens</h1>
              <p className="text-sm text-white/80">Conversa com escritório</p>
            </div>
          </div>
          {activeConversation && hasNotification(activeConversation.id) && (
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkAsRead}
              className="gap-2 text-white bg-[#F26800] border-[#F26800] hover:bg-[#E55A00]"
            >
              <Check className="h-3 w-3" />
              Marcar como lida
            </Button>
          )}
        </div>
        
        {/* Área de Mensagens */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto bg-white border-l border-r border-[#e5e7eb] p-6"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="min-h-full">
            {loadingOlder && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-2 text-[#34675C]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando mensagens antigas...</span>
                </div>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center space-x-2 text-[#34675C]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando mensagens...</span>
                </div>
              </div>
            ) : !activeConversation ? (
              <div className="flex items-center justify-center h-32 text-[#34675C]">
                <div className="text-center">
                  <p className="mb-2">Você ainda não tem conversas ativas.</p>
                  <p className="text-sm">Entre em contato conosco através dos outros canais de atendimento.</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-[#34675C]">
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
                    <div className="max-w-[70%] min-w-[100px]">
                      {/* Label do remetente */}
                      <div className={`text-xs font-medium mb-1 ${
                        message.sender_type === 'client' 
                          ? 'text-right text-white/80' 
                          : 'text-left text-[#34675C]'
                      }`}>
                        {message.sender_type === 'client' ? 'Você' : 'Suporte'}
                      </div>
                      
                      {/* Mensagem */}
                      <div
                        className="relative px-4 py-3 shadow-sm"
                        style={{
                          backgroundColor: message.sender_type === 'client'
                            ? '#053D38'
                            : '#f3f4f6',
                          color: message.sender_type === 'client'
                            ? '#ffffff'
                            : '#14140F',
                          borderRadius: message.sender_type === 'client' 
                            ? '12px 12px 4px 12px' 
                            : '12px 12px 12px 4px'
                        }}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {message.content}
                        </p>
                        
                        {/* Timestamp */}
                        <div className={`flex items-center mt-2 gap-1 ${
                          message.sender_type === 'client' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span 
                            className="text-xs"
                            style={{
                              color: message.sender_type === 'client' 
                                ? 'rgba(255,255,255,0.7)' 
                                : '#34675C',
                              opacity: 0.7
                            }}
                          >
                            {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.sender_type === 'client' && (
                            <div className="flex space-x-0.5 ml-1">
                              <div 
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
                              />
                              <div 
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Campo de Mensagem */}
        <div className="bg-white border border-[#e5e7eb] rounded-b-lg p-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
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
                className="min-h-[50px] max-h-[120px] resize-none border-[#e5e7eb] focus:border-[#053D38] focus:ring-[#053D38] rounded-lg placeholder:text-[#34675C]"
                rows={2}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || !activeConversation || isSending}
              size="icon"
              className="h-[50px] w-[50px] bg-[#053D38] hover:bg-[#34675C] text-white rounded-lg"
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
