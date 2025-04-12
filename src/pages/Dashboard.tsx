
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

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [clientInfo, setClientInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch real client data from the database
  useEffect(() => {
    if (!user) return;

    const fetchClientData = async () => {
      setIsLoading(true);
      try {
        // Fetch client info
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (clientData) {
          setClientInfo(clientData);
        }
        
        // Fetch client's documents
        const { data: documentsData } = await supabase
          .from('documents')
          .select('*')
          .eq('client_id', user.id);
          
        if (documentsData) {
          setDocuments(documentsData);
        } else {
          setDocuments([]);
        }
        
      } catch (error) {
        console.error("Error fetching client data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [user]);

  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome section */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Olá, {clientInfo?.full_name || 'Cliente'}!</h2>
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

        {/* Process information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Processo</CardTitle>
          </CardHeader>
          <CardContent>
            {clientInfo?.process_type ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Tipo de Processo</span>
                    <span className="font-medium">{clientInfo.process_type}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs w-fit ${
                      clientInfo.status === "active" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {clientInfo.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-muted-foreground">
                  Nenhuma informação de processo disponível no momento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents section */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Visualizar</Button>
                  </div>
                ))}
                
                {documents.length > 5 && (
                  <div className="text-center pt-2">
                    <Link to="/documents">
                      <Button variant="link">Ver todos os documentos</Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Nenhum documento disponível no momento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meetings section */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Reuniões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Nenhuma reunião agendada no momento.
                </p>
                <Button variant="outline" className="mt-4">Solicitar Agendamento</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
