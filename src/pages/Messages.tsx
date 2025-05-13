
import { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth";
import { useChat } from "@/hooks/useChat";
import { Send, PaperclipIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const Messages = () => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSending,
    handleSendMessage,
    handleStartConversation,
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

  const handleSend = () => {
    if (newMessage.trim() !== "") {
      handleSendMessage(newMessage);
      setNewMessage("");
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start a conversation if the user doesn't have one
  useEffect(() => {
    if (user && conversations.length === 0 && !isLoading) {
      handleStartConversation(user.id);
    }
  }, [user, conversations, isLoading, handleStartConversation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <MainLayout title="Mensagens">
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Conversa com Escritório de Advocacia</h2>
          <p className="text-sm text-muted-foreground">
            Todas as mensagens são arquivadas para referência futura
          </p>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            ⏰ As mensagens serão respondidas dentro do horário comercial
          </p>
        </div>

        {/* Messages list */}
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4 pr-2">
            {messages.map((msg) => (
              <Card
                key={msg.id}
                className={`max-w-3xl ${
                  msg.sender_type === "client"
                    ? "ml-auto bg-primary/5 border-primary/10"
                    : "mr-auto bg-secondary/10"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>
                          {msg.sender_type === "admin" ? "A" : "C"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {msg.sender_type === "admin" ? "Advogado" : "Você"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                </CardContent>
              </Card>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message input */}
        <div className="sticky bottom-0 bg-white pt-2">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="flex-shrink-0 flex space-x-2">
              <Button 
                onClick={handleSend} 
                disabled={isSending || !newMessage.trim()}
                className="h-10"
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
