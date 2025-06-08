import { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth";
import { useChat } from "@/hooks/useChat";
import { Send, User, Phone, Mail, FileText, Clock, AlertCircle, Plus, Search, Loader2 } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchClients } from "@/services/clients/fetchClients";
import { Client } from "@/services/clients/types";

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
          <Badge variant={client.status === 'documentacao' ? 'outline' : 'secondary'}>
            {client.status === 'documentacao' ? 'Documentação' : 
             client.status === 'em_andamento' ? 'Em Andamento' :
             client.status === 'concluido' ? 'Concluído' : client.status}
          </Badge>
        </div>
      </div>
    </div>
  );
};

const ConversationItem = ({ 
  conversation, 
  isActive, 
  onClick,
  unreadCount 
}: { 
  conversation: any, 
  isActive: boolean, 
  onClick: () => void,
  unreadCount?: number 
}) => {
  const client = conversation.client;
  
  if (!client) return null;
  
  const hasUnreadMessages = (unreadCount || 0) > 0;
  
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
            <div className="flex justify-between items-center">
              <p className="font-medium truncate">{client.full_name}</p>
              {hasUnreadMessages && (
                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                  {unreadCount}
                </div>
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
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Conversa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Selecionar Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Carregando clientes...
              </div>
            ) : filteredClients.length > 0 ? (
              <div className="space-y-2">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent/10 transition-colors"
                    onClick={() => handleSelectClient(client.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {client.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{client.full_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                        {client.process_type && (
                          <p className="text-xs text-muted-foreground truncate">
                            {client.process_type}
                          </p>
                        )}
                      </div>
                      <Badge variant={client.status === 'documentacao' ? 'outline' : 'secondary'}>
                        {client.status === 'documentacao' ? 'Documentação' : 
                         client.status === 'em_andamento' ? 'Em Andamento' :
                         client.status === 'concluido' ? 'Concluído' : client.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {searchTerm ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado."}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-96">
    <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
    <h3 className="text-xl font-medium">Sem conversas ativas</h3>
    <p className="text-sm text-muted-foreground text-center mt-2">
      Quando um cliente iniciar uma conversa, ela aparecerá aqui.
    </p>
    <p className="text-sm text-muted-foreground text-center mt-1">
      Ou inicie uma nova conversa com um cliente.
    </p>
  </div>
);

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
    reactivateAutoScroll,
    markMessageAsViewed,
    getUnreadCount,
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

  const handleNewConversation = async (clientId: string) => {
    await handleStartConversation(clientId);
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

  // Intersection Observer para detectar mensagens vistas
  const { observe: observeMessage } = useIntersectionObserver({
    onIntersect: (element) => {
      const messageId = element.getAttribute('data-message-id');
      const conversationId = element.getAttribute('data-conversation-id');
      const senderType = element.getAttribute('data-sender-type');
      
      if (messageId && conversationId && senderType === 'client') {
        markMessageAsViewed(messageId, conversationId);
      }
    },
    threshold: 0.5,
    enabled: !!activeConversation
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

  return (
    <MainLayout title="Chat com Clientes">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-10rem)]">
        {/* Conversations list - ALTURA FIXA */}
        <div className="md:col-span-1 border rounded-lg h-[calc(100vh-10rem)] flex flex-col">
          <div className="h-14 p-3 border-b bg-secondary/10 flex-shrink-0 flex items-center">
            <div className="flex items-center justify-between w-full">
              <h3 className="font-semibold">Conversas</h3>
              <NewConversationModal onClientSelect={handleNewConversation} />
            </div>
          </div>
          <div className="h-[calc(100vh-14rem)] overflow-y-auto">
            <div className="space-y-1 p-2">
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
                      unreadCount={getUnreadCount(conversation.id)}
                    />
                  ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhuma conversa encontrada
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat area - ALTURA FIXA */}
        <div className="md:col-span-2 border rounded-lg h-[calc(100vh-10rem)] flex flex-col">
          {activeConversation ? (
            <>
              {/* Header fixo */}
              <div className="h-14 p-3 border-b bg-secondary/10 flex-shrink-0 flex items-center justify-between">
                <h3 className="font-semibold">
                  Chat com {activeConversation.client?.full_name}
                </h3>
                {getUnreadCount(activeConversation.id) > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {getUnreadCount(activeConversation.id)} nova{getUnreadCount(activeConversation.id) > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Área de mensagens - altura fixa com scroll interno */}
              <div 
                ref={messagesContainerRef}
                className="h-[calc(100vh-20rem)] overflow-y-auto bg-gray-50 p-4"
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
                
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <Card
                        key={msg.id}
                        ref={(el) => {
                          if (el && msg.sender_type === 'client') {
                            el.setAttribute('data-message-id', msg.id);
                            el.setAttribute('data-conversation-id', activeConversation.id);
                            el.setAttribute('data-sender-type', msg.sender_type);
                            observeMessage(el);
                          }
                        }}
                        className={`max-w-xs sm:max-w-sm md:max-w-md ${
                          msg.sender_type === "admin"
                            ? "ml-auto bg-primary/5 border-primary/10"
                            : "mr-auto bg-secondary/10"
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm">
                              {msg.sender_type === "admin" ? "Você" : "Cliente"}
                            </span>
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
              <div className="h-20 p-4 border-t flex-shrink-0 bg-background flex items-center">
                <div className="flex space-x-2 w-full">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 resize-none min-h-[3rem] max-h-[3rem]"
                    rows={2}
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isSending || !newMessage.trim() || !activeConversation}
                    className="h-12"
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

        {/* Client info - ALTURA FIXA */}
        <div className="md:col-span-1 border rounded-lg h-[calc(100vh-10rem)] overflow-y-auto">
          {activeConversation ? (
            <ClientInfo activeConversation={activeConversation} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="mb-2">📋</p>
                <p>Selecione uma conversa</p>
                <p className="text-sm">para ver detalhes do cliente</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminMessages;
