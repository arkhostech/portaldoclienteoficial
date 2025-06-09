import { useState, useRef, useEffect, useLayoutEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth";
import { useChat } from "@/hooks/useChat";
import { Send, User, Phone, Mail, FileText, Clock, AlertCircle, Plus, Search, Loader2, Check } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchClients } from "@/services/clients/fetchClients";
import { Client } from "@/services/clients/types";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { NewMessageBadge } from "@/components/ui/new-message-badge";
import { useNotifications } from "@/contexts/NotificationContext";

// Componente EmptyState
const EmptyState = () => (
  <div className="flex-1 flex items-center justify-center text-center">
    <div className="max-w-md">
      <div className="mb-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Nenhuma conversa selecionada</h3>
      <p className="text-muted-foreground mb-4">
        Selecione uma conversa da lista ao lado ou inicie uma nova conversa com um cliente.
      </p>
    </div>
  </div>
);

// Helper function para extrair iniciais
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Helper function para formatar a data da última mensagem  
const formatLastMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Agora';
  if (diffInMinutes < 60) return `${diffInMinutes}min`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit' 
  });
};

// Função para formatar data completa
const formatMessageDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NewConversationModal = ({ onClientSelect }: { onClientSelect: (clientId: string) => void }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const clientData = await fetchClients();
      setClients(clientData);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadClients();
    }
  }, [open]);

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  const handleSelectClient = (clientId: string) => {
    onClientSelect(clientId);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="mb-4">
          <Plus className="h-4 w-4 mr-2" />
          Nova Conversa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Selecionar Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredClients.length > 0 ? (
              <div className="space-y-2">
                {filteredClients.map((client) => (
                  <Card
                    key={client.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectClient(client.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(client.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{client.full_name}</p>
                          <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                          {client.phone && (
                            <p className="text-sm text-muted-foreground">{client.phone}</p>
                          )}
                        </div>
                                                 <Badge variant="secondary">
                           {client.status}
                         </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente disponível'}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Componente Modal para Informações do Cliente
const ClientInfoModal = ({ activeConversation }: { activeConversation: any }) => {
  const [open, setOpen] = useState(false);
  const client = activeConversation?.client;
  
  if (!client) return null;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          Informações do Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Informações do Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg">
                {client.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{client.full_name}</h3>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{client.email}</span>
            </div>
            
            {client.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.phone}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Tipo de Processo: {client.process_type?.name || "Não definido"}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Status: 
                                 <Badge variant="secondary" className="ml-2">
                   {client.status}
                 </Badge>
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminMessages = () => {
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
    handleSelectConversation,
    handleStartConversation,
    loadOlderMessages,
    setViewingOldMessages,
    isViewingOldMessages,
    registerScrollContainer,
    handleMarkAsRead
  } = useChat();
  
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

  const handleNewConversation = async (clientId: string) => {
    await handleStartConversation(clientId);
  };

  // Hooks de scroll
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

  useScrollPosition({
    containerRef: messagesContainerRef,
    isLoading: loadingOlder,
    dependency: messages.length
  });

  useScrollToBottom({
    containerRef: messagesContainerRef,
    onNearBottom: () => {
      setViewingOldMessages(false);
    },
    threshold: 100,
    enabled: !!activeConversation
  });

  // Registrar container de scroll
  useEffect(() => {
    registerScrollContainer(messagesContainerRef.current);
  }, [registerScrollContainer]);

  // Auto-scroll para novas mensagens
  useLayoutEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current && messages.length > 0 && !isLoading) {
      // Aplicar scroll imediatamente de forma síncrona
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
    }
  }, [shouldAutoScroll, messages.length, isLoading]);

  return (
    <MainLayout title="Central de Mensagens">
      <div className="flex h-[calc(100vh-200px)] max-w-7xl mx-auto gap-4">
        {/* Lista de conversas */}
        <div className="w-80 flex-shrink-0 bg-background border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conversas</h2>
            <NewConversationModal onClientSelect={handleNewConversation} />
          </div>
          
          <ScrollArea className="h-[calc(100%-4rem)]">
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className={`cursor-pointer transition-colors relative ${
                    activeConversation?.id === conv.id 
                      ? 'bg-accent border-primary' 
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(conv.client?.full_name || 'Cliente')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate">
                            {conv.client?.full_name || 'Cliente'}
                          </p>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {formatLastMessageTime(conv.updated_at)}
                            </span>
                            <NewMessageBadge 
                              show={hasNotification(conv.id)}
                            />
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.client?.process_type?.name || "Tipo não definido"}
                        </p>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {conv.client?.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {conversations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Nenhuma conversa ainda</p>
                  <p className="text-xs mt-1">Inicie uma nova conversa</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Área de mensagens */}
        <div className="flex-1 flex flex-col bg-background border rounded-lg">
          {activeConversation ? (
            <>
              {/* Header da conversa */}
              <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(activeConversation.client?.full_name || 'Cliente')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{activeConversation.client?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeConversation.client?.process_type?.name || "Tipo não definido"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
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
                  <ClientInfoModal activeConversation={activeConversation} />
                </div>
              </div>
              
              {/* Área de mensagens com scroll */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4"
              >
                {loadingOlder && (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Carregando mensagens antigas...</span>
                    </div>
                  </div>
                )}
                
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <Card
                        key={msg.id}
                        className={`max-w-xs sm:max-w-sm md:max-w-md ${
                          msg.sender_type === "admin"
                            ? "ml-auto bg-primary/5 border-primary/10"
                            : "mr-auto bg-secondary/10"
                        } ${msg.id.startsWith('temp-') ? 'opacity-70' : ''}`}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm">
                              {msg.sender_type === "admin" ? "Você" : "Cliente"}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {msg.id.startsWith('temp-') ? (
                                <span className="flex items-center space-x-1">
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                                  <span>Enviando...</span>
                                </span>
                              ) : formatDate(msg.created_at)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg mb-2">💬</p>
                      <p>Nenhuma mensagem na conversa ainda</p>
                      <p className="text-sm">Envie uma mensagem para começar</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input fixo na parte de baixo */}
              <div className="h-36 p-4 border-t flex-shrink-0 bg-background flex items-center">
                <div className="flex space-x-2 w-full">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 resize-none min-h-[120px] max-h-[200px]"
                    rows={5}
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isSending || !newMessage.trim() || !activeConversation}
                    className="h-[120px]"
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

      </div>
    </MainLayout>
  );
};

export default AdminMessages;
