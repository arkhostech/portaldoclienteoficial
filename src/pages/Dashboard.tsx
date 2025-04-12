
import { useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import StatusCard from "@/components/ui/StatusCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckSquare, FileText, MessageSquare, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Document, Task, Message, CaseStatus } from "@/utils/dummyData";

const Dashboard = () => {
  const [progress, setProgress] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [caseStatuses, setCaseStatuses] = useState<CaseStatus[]>([]);
  const [clientName, setClientName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Simulate loading animation for progress bar
  useEffect(() => {
    const timer = setTimeout(() => setProgress(65), 500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch real client data from the database
  useEffect(() => {
    if (!user) return;

    const fetchClientData = async () => {
      setIsLoading(true);
      try {
        // Fetch client profile info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profileData?.full_name) {
          setClientName(profileData.full_name);
        }
        
        // Fetch client's documents
        const { data: documentsData } = await supabase
          .from('documents')
          .select('*')
          .eq('client_id', user.id);
          
        if (documentsData) {
          const formattedDocs = documentsData.map(doc => ({
            id: doc.id,
            name: doc.title,
            type: doc.file_type || 'Unknown',
            category: 'Documents', // Default category
            uploadedBy: 'Admin',
            uploadDate: doc.created_at,
            size: doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'Unknown',
            needsSignature: false,
            signed: false
          }));
          setDocuments(formattedDocs);
        }
        
        // For tasks, messages and case statuses, we'd fetch from their respective tables
        // Since these tables don't exist yet, we'll show empty states
        setTasks([]);
        setMessages([]);
        setCaseStatuses([]);
        
      } catch (error) {
        console.error("Error fetching client data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [user]);

  const unreadMessages = messages.filter((msg) => !msg.read).length;
  const pendingDocuments = documents.filter((doc) => doc.needsSignature && !doc.signed).length;
  const pendingTasks = tasks.filter((task) => !task.completed).length;

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome section */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Olá, {clientName || 'Cliente'}!</h2>
            <p className="text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Ver Relatórios
            </Button>
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" />
              Contatar Advogado
            </Button>
          </div>
        </div>

        {/* Status cards */}
        {caseStatuses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseStatuses.map((status) => (
              <StatusCard
                key={status.id}
                title={status.title}
                status={status.status}
                currentStep={status.currentStep}
                nextSteps={status.nextSteps}
                lastUpdated={status.lastUpdated}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <h3 className="text-lg font-medium mb-2">Nenhum processo cadastrado</h3>
              <p className="text-muted-foreground">
                Não há processos ativos para este cliente no momento.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Progress and actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Status do Processo</CardTitle>
            </CardHeader>
            <CardContent>
              {caseStatuses.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Progresso Total</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Data de Início</span>
                      <span className="font-medium">15/03/2023</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Estimativa de Conclusão</span>
                      <span className="font-medium">30/06/2023</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Tipo de Processo</span>
                      <span className="font-medium">EB-2 NIW</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Advogado Responsável</span>
                      <span className="font-medium">Dr. Maria Silva</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground">
                    Nenhum processo ativo no momento.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próxima Reunião</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <Calendar className="h-10 w-10 text-brand-600 mr-4" />
                <div>
                  <p className="font-medium">Sem reuniões agendadas</p>
                  <p className="text-sm text-muted-foreground">Entre em contato para agendar</p>
                </div>
              </div>
              <Button className="w-full mb-2">Solicitar Agendamento</Button>
              <Button variant="outline" className="w-full">Histórico de Reuniões</Button>
            </CardContent>
          </Card>
        </div>

        {/* Action items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/documents" className="block">
            <Card className={`h-full transition-all hover:border-brand-500 ${pendingDocuments > 0 ? 'border-orange-300 bg-orange-50' : ''}`}>
              <CardContent className="flex items-center p-6">
                <div className={`rounded-full p-3 mr-4 ${pendingDocuments > 0 ? 'bg-orange-100' : 'bg-muted'}`}>
                  <FileText className={`h-6 w-6 ${pendingDocuments > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h3 className="font-medium">Documentos</h3>
                  <p className="text-sm text-muted-foreground">
                    {documents.length === 0 
                      ? "Nenhum documento disponível" 
                      : pendingDocuments > 0 
                        ? `${pendingDocuments} documento(s) aguardando assinatura` 
                        : `${documents.length} documento(s) disponível(is)`}
                  </p>
                </div>
                {pendingDocuments > 0 && (
                  <div className="ml-auto">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link to="/messages" className="block">
            <Card className={`h-full transition-all hover:border-brand-500 ${unreadMessages > 0 ? 'border-blue-300 bg-blue-50' : ''}`}>
              <CardContent className="flex items-center p-6">
                <div className={`rounded-full p-3 mr-4 ${unreadMessages > 0 ? 'bg-blue-100' : 'bg-muted'}`}>
                  <MessageSquare className={`h-6 w-6 ${unreadMessages > 0 ? 'text-blue-500' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h3 className="font-medium">Mensagens</h3>
                  <p className="text-sm text-muted-foreground">
                    {messages.length === 0 
                      ? "Nenhuma mensagem disponível" 
                      : unreadMessages > 0 
                        ? `${unreadMessages} mensagem(ns) não lida(s)` 
                        : "Todas as mensagens lidas"}
                  </p>
                </div>
                {unreadMessages > 0 && (
                  <div className="ml-auto">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs">
                      {unreadMessages}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard" className="block">
            <Card className={`h-full transition-all hover:border-brand-500 ${pendingTasks > 0 ? 'border-purple-300 bg-purple-50' : ''}`}>
              <CardContent className="flex items-center p-6">
                <div className={`rounded-full p-3 mr-4 ${pendingTasks > 0 ? 'bg-purple-100' : 'bg-muted'}`}>
                  <CheckSquare className={`h-6 w-6 ${pendingTasks > 0 ? 'text-purple-500' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h3 className="font-medium">Tarefas</h3>
                  <p className="text-sm text-muted-foreground">
                    {tasks.length === 0 
                      ? "Nenhuma tarefa disponível" 
                      : pendingTasks > 0 
                        ? `${pendingTasks} tarefa(s) pendente(s)` 
                        : "Todas as tarefas concluídas"}
                  </p>
                </div>
                {pendingTasks > 0 && (
                  <div className="ml-auto">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-white text-xs">
                      {pendingTasks}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
