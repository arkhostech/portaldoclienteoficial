import { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth";
import { useChat } from "@/hooks/useChat";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { Send, PaperclipIcon, Loader2 } from "lucide-react";
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
    handleStartConversation,
    loadOlderMessages,
    reactivateAutoScroll,
  } = useChat();

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
    if (newMessage.trim() !== "" && user) {
      // If no active conversation exists, create one first
      if (!activeConversation) {
        await handleStartConversation(user.id);
        // Wait a bit for the conversation to be set
        setTimeout(() => {
          handleSendMessage(newMessage);
          setNewMessage("");
        }, 100);
      } else {
        handleSendMessage(newMessage);
        setNewMessage("");
      }
    }
  };

  // Scroll infinito para carregar mensagens antigas
  useScrollToTop({
    containerRef: messagesContainerRef,
    onScrollToTop: () => {
      if (activeConversation && hasMoreMessages && !loadingOlder) {
        loadOlderMessages(activeConversation.id);
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

  // Reativa auto-scroll quando usuário rola para próximo do final
  useScrollToBottom({
    containerRef: messagesContainerRef,
    onNearBottom: reactivateAutoScroll,
    threshold: 100,
    enabled: !!activeConversation && !shouldAutoScroll
  });

  // Auto-scroll to bottom apenas para novas mensagens (não quando carrega antigas)
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current && shouldAutoScroll && !loadingOlder) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        const scrollContainer = messagesContainerRef.current;
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }, 100);
    }
  }, [messages.length, shouldAutoScroll, loadingOlder]);

  // Start a conversation if the user doesn't have one
  useEffect(() => {
    if (user && conversations.length === 0 && !isLoading && !activeConversation) {
      // Only auto-start conversation if it's the first time loading and there are truly no conversations
      // Conversation will be created when user sends their first message
    }
  }, [user, conversations, isLoading, handleStartConversation, activeConversation]);

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
            className="h-full overflow-y-auto p-4"
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
            
            {/* Indicador se tem mais mensagens */}
            {!hasMoreMessages && messages.length > 0 && (
              <div className="text-center py-2 text-xs text-muted-foreground">
                • Início da conversa •
              </div>
            )}
            
            <div className="space-y-4 min-h-full flex flex-col">
              <div className="flex-1">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <Card
                        key={msg.id}
                        className={`max-w-xs sm:max-w-sm md:max-w-md ${
                          msg.sender_type === "client"
                            ? "ml-auto bg-primary/5 border-primary/10"
                            : "mr-auto bg-secondary/10"
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <Avatar className="h-5 w-5 mr-2">
                                <AvatarFallback className="text-xs">
                                  {msg.sender_type === "admin" ? "A" : "C"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">
                                {msg.sender_type === "admin" ? "Advogado" : "Você"}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatDate(msg.created_at)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg mb-2">💬</p>
                      <p>Nenhuma mensagem ainda</p>
                      <p className="text-sm">Envie uma mensagem para começar a conversa</p>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Message input - fixed at bottom */}
        <div className="flex-shrink-0 border-t bg-background pt-4 mt-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="resize-none min-h-[3rem] max-h-32"
                rows={2}
              />
            </div>
            <div className="flex-shrink-0 flex space-x-2">
              <Button 
                onClick={handleSend} 
                disabled={isSending || !newMessage.trim()}
                className="h-12"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
