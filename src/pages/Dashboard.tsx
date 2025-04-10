
import { useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import StatusCard from "@/components/ui/StatusCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { caseStatuses, documents, tasks, messages } from "@/utils/dummyData";
import { Calendar, CheckSquare, FileText, MessageSquare, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [progress, setProgress] = useState(0);

  // Simulate loading animation for progress bar
  useEffect(() => {
    const timer = setTimeout(() => setProgress(65), 500);
    return () => clearTimeout(timer);
  }, []);

  const unreadMessages = messages.filter((msg) => !msg.read).length;
  const pendingDocuments = documents.filter((doc) => doc.needsSignature && !doc.signed).length;
  const pendingTasks = tasks.filter((task) => !task.completed).length;

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome section */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Olá, João!</h2>
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

        {/* Progress and actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Status do Processo</CardTitle>
            </CardHeader>
            <CardContent>
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
                  <p className="font-medium">Atualização Quinzenal</p>
                  <p className="text-sm text-muted-foreground">18/04/2023, 14:00</p>
                </div>
              </div>
              <Button className="w-full mb-2">Entrar na Chamada</Button>
              <Button variant="outline" className="w-full">Reagendar</Button>
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
                    {pendingDocuments > 0 
                      ? `${pendingDocuments} documento(s) aguardando assinatura` 
                      : "Todos os documentos estão em dia"}
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
                    {unreadMessages > 0 
                      ? `${unreadMessages} mensagem(ns) não lida(s)` 
                      : "Nenhuma mensagem não lida"}
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
                    {pendingTasks > 0 
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
