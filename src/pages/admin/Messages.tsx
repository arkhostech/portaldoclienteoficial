
import { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth";
import { useChat } from "@/hooks/useChat";
import { Send, User, Phone, Mail, FileText, Clock, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

const ClientInfo = ({ activeConversation }: { activeConversation: any }) => {
  const client = activeConversation?.client;
  
  if (!client) return null;
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Informações do Cliente</h3>
      <div className="space-y-3">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          <div>{client.full_name}</div>
        </div>
        
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <div>{client.email}</div>
        </div>
        
        {client.phone && (
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <div>{client.phone}</div>
          </div>
        )}
        
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
          <div>
            {activeConversation.process_type || "Processo não especificado"}
          </div>
        </div>
        
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          <Badge variant={client.status === 'active' ? 'outline' : 'secondary'}>
            {client.status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

const ConversationItem = ({ 
  conversation, 
  isActive, 
  onClick 
}: { 
  conversation: any, 
  isActive: boolean, 
  onClick: () => void 
}) => {
  const client = conversation.client;
  
  if (!client) return null;
  
  const hasUnreadMessages = false; // Future implementation
  
  return (
    <div 
      className={`p-3 cursor-pointer border-b hover:bg-accent/5 transition-colors ${
        isActive ? 'bg-primary/5 border-l-2 border-l-primary' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarFallback>
            {client.full_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <p className="font-medium truncate">{client.full_name}</p>
            {hasUnreadMessages && (
              <Badge variant="default" className="ml-2">Novo</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {conversation.process_type || "Processo não especificado"}
          </p>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-96">
    <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
    <h3 className="text-xl font-medium">Sem conversas ativas</h3>
    <p className="text-sm text-muted-foreground text-center mt-2">
      Quando um cliente iniciar uma conversa, ela aparecerá aqui.
    </p>
  </div>
);

const AdminMessages = () => {
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
    handleSelectConversation,
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
    if (newMessage.trim() !== "" && activeConversation) {
      handleSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <MainLayout title="Chat com Clientes">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-10rem)]">
        {/* Conversations list */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden">
          <div className="p-3 border-b bg-secondary/10">
            <h3 className="font-semibold">Conversas</h3>
          </div>
          <ScrollArea className="h-[calc(100vh-12.5rem)]">
            {isLoading && !conversations.length ? (
              <div className="p-4 text-center text-muted-foreground">
                Carregando conversas...
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={activeConversation?.id === conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                />
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma conversa encontrada
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="md:col-span-2 border rounded-lg flex flex-col">
          {activeConversation ? (
            <>
              <div className="p-3 border-b bg-secondary/10">
                <h3 className="font-semibold">
                  Chat com {activeConversation.client?.full_name}
                </h3>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <Card
                        key={msg.id}
                        className={`max-w-3xl ${
                          msg.sender_type === "admin"
                            ? "ml-auto bg-primary/5 border-primary/10"
                            : "mr-auto bg-secondary/10"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">
                              {msg.sender_type === "admin" ? "Você" : "Cliente"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(msg.created_at)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground">
                      Nenhuma mensagem na conversa ainda
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 resize-none"
                    rows={2}
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isSending || !newMessage.trim() || !activeConversation}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Client info */}
        <div className="md:col-span-1">
          {activeConversation ? (
            <ClientInfo activeConversation={activeConversation} />
          ) : (
            <div className="border rounded-lg p-4 text-center text-muted-foreground">
              Selecione uma conversa para ver detalhes do cliente
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminMessages;
