import { useState, useRef, useEffect, useLayoutEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth";
import { useChat } from "@/hooks/useChat";
import { Send, User, Phone, Mail, FileText, Clock, AlertCircle, Plus, Search, Loader2, Check, CheckCircle, Download } from "lucide-react";
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const getStatusDetails = (status) => {
  switch (status) {
    case "documentacao":
      return {
        label: "Documentação",
        color: "rgba(255,255,255,0.8)",
        bgColor: "#053D38",
        icon: <FileText className="h-3 w-3 mr-1" />,
      };
    case "em_andamento":
      return {
        label: "Em Andamento",
        color: "#fff",
        bgColor: "#F26800",
        icon: <Clock className="h-3 w-3 mr-1" />,
      };
    case "concluido":
      return {
        label: "Concluído",
        color: "#14140F",
        bgColor: "#A3CCAB",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      };
    default:
      return {
        label: status,
        color: "#374151",
        bgColor: "#e5e7eb",
        icon: null,
      };
  }
};

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
        <Button 
          size="sm" 
          className="mb-4 text-white"
          style={{
            backgroundColor: '#053D38'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#34675C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#053D38';
          }}
        >
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#34675C' }} />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ borderColor: '#e5e7eb' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#053D38';
                  e.target.style.outline = 'none';
                  e.target.style.boxShadow = '0 0 0 1px #053D38';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
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
                    className="cursor-pointer transition-colors"
                    onClick={() => handleSelectClient(client.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(163, 204, 171, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback
                            style={{
                              backgroundColor: '#34675C',
                              color: 'white'
                            }}
                          >
                            {getInitials(client.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" style={{ color: '#14140F' }}>{client.full_name}</p>
                          <p className="text-sm truncate" style={{ color: '#34675C' }}>{client.email}</p>
                          {client.phone && (
                            <p className="text-sm" style={{ color: '#34675C' }}>{client.phone}</p>
                          )}
                        </div>
                        {(() => {
                          const statusDetails = getStatusDetails(client.status);
                          return (
                            <div
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{ backgroundColor: statusDetails.bgColor, color: statusDetails.color }}
                            >
                              {statusDetails.icon}
                              {statusDetails.label}
                            </div>
                          );
                        })()}
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
        <Button 
          variant="outline" 
          size="sm"
          className="border-0 transition-all duration-200 ease-in-out"
          style={{
            backgroundColor: '#A3CCAB',
            color: '#14140F',
            borderRadius: '8px',
            padding: '12px 16px',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#34675C';
            e.currentTarget.style.color = '#ffffff';
            const icon = e.currentTarget.querySelector('svg');
            if (icon) {
              (icon as unknown as HTMLElement).style.color = '#ffffff';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#A3CCAB';
            e.currentTarget.style.color = '#14140F';
            const icon = e.currentTarget.querySelector('svg');
            if (icon) {
              (icon as unknown as HTMLElement).style.color = '#14140F';
            }
          }}
        >
          <User 
            className="h-4 w-4 mr-2 transition-colors duration-200" 
            style={{ color: '#14140F' }}
          />
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
              <AvatarFallback 
                className="text-lg"
                style={{
                  backgroundColor: '#34675C',
                  color: 'white'
                }}
              >
                {client.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg" style={{ color: '#14140F' }}>{client.full_name}</h3>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" style={{ color: '#34675C' }} />
              <span className="text-sm" style={{ color: '#34675C' }}>{client.email}</span>
            </div>
            
            {client.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" style={{ color: '#34675C' }} />
                <span className="text-sm" style={{ color: '#34675C' }}>{client.phone}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" style={{ color: '#34675C' }} />
              <span className="text-sm" style={{ color: '#34675C' }}>
                Tipo de Processo: {client.process_type?.name || "Não definido"}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" style={{ color: '#34675C' }} />
              <span className="text-sm" style={{ color: '#34675C' }}>
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

  const handleExportChat = async () => {
    if (!activeConversation || messages.length === 0) {
      return;
    }

    try {
      const pdf = new jsPDF();
      
      // Configurações do PDF
      const margin = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const maxLineWidth = pageWidth - (2 * margin);
      
      // Título
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Histórico de Conversa', margin, 30);
      
      // Informações do cliente
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Cliente: ${activeConversation.client?.full_name || 'Nome não informado'}`, margin, 45);
      pdf.text(`Email: ${activeConversation.client?.email || 'Email não informado'}`, margin, 55);
      pdf.text(`Data de Exportação: ${new Date().toLocaleDateString('pt-BR')}`, margin, 65);
      
      let yPosition = 80;
      
      // Mensagens
      pdf.setFontSize(10);
      
      for (const message of messages) {
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 30;
        }
        
        // Informações da mensagem
        const sender = message.sender_type === 'admin' ? 'Admin' : activeConversation.client?.full_name || 'Cliente';
        const date = new Date(message.created_at).toLocaleString('pt-BR');
        
        // Cabeçalho da mensagem
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${sender} - ${date}`, margin, yPosition);
        yPosition += 8;
        
        // Conteúdo da mensagem
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(message.content, maxLineWidth);
        
        for (const line of lines) {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 30;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 6;
        }
        
        yPosition += 10; // Espaço entre mensagens
      }
      
      // Salvar o PDF
      const fileName = `conversa_${activeConversation.client?.full_name || 'cliente'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erro ao exportar chat:', error);
      alert('Erro ao exportar conversa. Tente novamente.');
    }
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
      <style>{`
        input::placeholder, textarea::placeholder { color: #34675C !important; }
        main { padding: 1rem !important; }
        @media (min-width: 768px) {
          main { padding: 1.5rem !important; }
        }
      `}</style>
      <div className="flex h-[calc(100vh-80px)] max-w-7xl mx-auto gap-4">
        {/* Lista de conversas */}
        <div className="w-80 flex-shrink-0 bg-background border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: '#14140F' }}>Conversas</h2>
            <NewConversationModal onClientSelect={handleNewConversation} />
          </div>
          
          <ScrollArea className="h-[calc(100%-4rem)]">
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="cursor-pointer transition-colors relative"
                  style={{
                    backgroundColor: activeConversation?.id === conv.id 
                      ? '#053D38' 
                      : 'white',
                    color: activeConversation?.id === conv.id 
                      ? 'white' 
                      : 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    if (activeConversation?.id !== conv.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(163, 204, 171, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeConversation?.id !== conv.id) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarFallback 
                          style={{
                            backgroundColor: '#34675C',
                            color: 'white'
                          }}
                        >
                          {getInitials(conv.client?.full_name || 'Cliente')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p 
                            className="font-medium text-sm truncate"
                            style={{ 
                              color: activeConversation?.id === conv.id 
                                ? 'white' 
                                : '#14140F' 
                            }}
                          >
                            {conv.client?.full_name || 'Cliente'}
                          </p>
                          <div className="flex flex-col items-end gap-1">
                            <span 
                              className="text-xs flex-shrink-0"
                              style={{ 
                                color: activeConversation?.id === conv.id 
                                  ? 'rgba(255,255,255,0.7)' 
                                  : 'rgba(52, 103, 92, 0.7)' 
                              }}
                            >
                              {formatLastMessageTime(conv.updated_at)}
                            </span>
                            <NewMessageBadge 
                              show={hasNotification(conv.id)}
                            />
                          </div>
                        </div>
                        
                        <p 
                          className="text-xs truncate"
                          style={{ 
                            color: activeConversation?.id === conv.id 
                              ? 'rgba(255,255,255,0.8)' 
                              : '#34675C' 
                          }}
                        >
                          {conv.client?.process_type?.name || "Tipo não definido"}
                        </p>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span 
                            className="text-xs"
                            style={{ 
                              color: activeConversation?.id === conv.id 
                                ? 'rgba(255,255,255,0.8)' 
                                : '#34675C' 
                            }}
                          >
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
              <div 
                className="p-5 border-b flex items-center justify-between" 
                style={{ 
                  backgroundColor: '#14140F',
                  borderBottomColor: 'rgba(163, 204, 171, 0.2)'
                }}
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      style={{
                        backgroundColor: '#A3CCAB',
                        color: '#14140F'
                      }}
                    >
                      {getInitials(activeConversation.client?.full_name || 'Cliente')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col justify-center">
                    <h3 
                      className="font-semibold text-base leading-tight" 
                      style={{ 
                        color: '#ffffff',
                        fontWeight: '600'
                      }}
                    >
                      {activeConversation.client?.full_name}
                    </h3>
                    <p 
                      className="text-sm leading-tight mt-0.5" 
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}
                    >
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
                      className="gap-2 text-white"
                      style={{ 
                        backgroundColor: '#F26800',
                        borderColor: '#F26800'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#E55A00';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F26800';
                      }}
                    >
                      <Check className="h-3 w-3" />
                      Marcar como lida
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportChat}
                    disabled={!messages.length}
                    className="border-0 transition-all duration-200 ease-in-out"
                    style={{
                      backgroundColor: '#A3CCAB',
                      color: '#14140F',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#34675C';
                        e.currentTarget.style.color = '#ffffff';
                        const icon = e.currentTarget.querySelector('svg');
                        if (icon) {
                          (icon as unknown as HTMLElement).style.color = '#ffffff';
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#A3CCAB';
                        e.currentTarget.style.color = '#14140F';
                        const icon = e.currentTarget.querySelector('svg');
                        if (icon) {
                          (icon as unknown as HTMLElement).style.color = '#14140F';
                        }
                      }
                    }}
                  >
                    <Download 
                      className="h-4 w-4 mr-2 transition-colors duration-200" 
                      style={{ color: '#14140F' }}
                    />
                    Exportar
                  </Button>
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
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender_type === "admin" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`relative inline-block px-4 py-2 rounded-2xl shadow-sm ${
                            msg.id.startsWith('temp-') ? 'opacity-70' : ''
                          }`}
                          style={{
                            backgroundColor: msg.sender_type === "admin" 
                              ? '#053D38' 
                              : '#ffffff',
                            color: msg.sender_type === "admin" 
                              ? 'white' 
                              : '#14140F',
                            maxWidth: msg.content.length > 50 ? '85%' : 
                                    msg.content.length > 20 ? '60%' : 
                                    'fit-content',
                            minWidth: '80px',
                            border: msg.sender_type === "admin" ? 'none' : '1px solid #e5e7eb',
                            borderRadius: msg.sender_type === "admin" 
                              ? '18px 18px 4px 18px' 
                              : '18px 18px 18px 4px'
                          }}
                        >
                          {/* Triangular tail for WhatsApp style */}
                          <div
                            className="absolute w-0 h-0"
                            style={{
                              ...(msg.sender_type === "admin" ? {
                                right: '-6px',
                                bottom: '2px',
                                borderLeft: '8px solid #053D38',
                                borderTop: '8px solid transparent',
                                borderBottom: '2px solid transparent'
                              } : {
                                left: '-6px',
                                bottom: '2px',
                                borderRight: '8px solid #ffffff',
                                borderTop: '8px solid transparent',
                                borderBottom: '2px solid transparent'
                              })
                            }}
                          />
                          
                          <div className="flex justify-between items-start gap-3">
                            <span 
                              className="font-medium text-xs"
                              style={{
                                color: msg.sender_type === "admin" 
                                  ? 'rgba(255,255,255,0.9)' 
                                  : '#34675C'
                              }}
                            >
                              {msg.sender_type === "admin" ? "Você" : activeConversation?.client?.full_name?.split(' ')[0] || "Cliente"}
                            </span>
                          </div>
                          
                          <p 
                            className="text-sm whitespace-pre-wrap break-words mt-1 leading-relaxed"
                            style={{
                              color: msg.sender_type === "admin" 
                                ? 'white' 
                                : '#14140F'
                            }}
                          >
                            {msg.content}
                          </p>
                          
                          <div className="flex justify-end items-center mt-2 gap-1">
                            <span 
                              className="text-xs"
                              style={{
                                color: msg.sender_type === "admin" 
                                  ? 'rgba(255,255,255,0.7)' 
                                  : '#34675C'
                              }}
                            >
                              {msg.id.startsWith('temp-') ? (
                                <span className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                                  <span>Enviando</span>
                                </span>
                              ) : (
                                new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              )}
                            </span>
                            {msg.sender_type === "admin" && !msg.id.startsWith('temp-') && (
                              <div className="flex space-x-0.5">
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
                    className="flex-1 resize-none min-h-[120px] max-h-[200px] border-gray-200"
                    style={{ 
                      borderColor: '#e5e7eb'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#053D38';
                      e.target.style.outline = 'none';
                      e.target.style.boxShadow = '0 0 0 1px #053D38';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    rows={5}
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isSending || !newMessage.trim() || !activeConversation}
                    className="h-[120px] text-white"
                    style={{
                      backgroundColor: '#053D38'
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#34675C';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#053D38';
                      }
                    }}
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
