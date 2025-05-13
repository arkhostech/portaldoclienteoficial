
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/Layout/MainLayout";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth";
import { useChat } from "@/hooks/useChat";
import { Send } from "lucide-react";
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
    handleStartConversation
  } = useChat();

  useEffect(() => {
    // If user exists and there are no conversations yet, start a conversation
    if (user && !isLoading && conversations.length === 0) {
      console.log("Starting new conversation for client");
      handleStartConversation(user.id);
    }
  }, [user, conversations, isLoading, handleStartConversation]);

  // Fixed: Modified the key press handler to prevent default action first
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent the default enter key behavior first
      handleSend();       // Then call the send function once
    }
  };

  const handleSend = () => {
    if (newMessage.trim() && activeConversation) {
      handleSendMessage(newMessage);
      setNewMessage("");
    }
  };

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

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <MainLayout title="Mensagens">
      <div className="container mx-auto max-w-4xl">
        <Card className="overflow-hidden">
          <div className="bg-secondary/10 p-4 border-b">
            <h2 className="font-semibold">Chat com o Escritório</h2>
          </div>
          
          <ScrollArea className="h-[calc(70vh-8rem)] p-4">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Carregando mensagens...</div>
              ) : messages.length > 0 ? (
                messages.map((msg) => (
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
                        <span className="font-medium">
                          {msg.sender_type === "client" ? "Você" : "Advogado"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Envie uma mensagem para iniciar a conversa com nossos advogados.
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Textarea
                placeholder="Escreva sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 resize-none"
                rows={2}
              />
              <Button onClick={handleSend} disabled={isSending || !newMessage.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Messages;
