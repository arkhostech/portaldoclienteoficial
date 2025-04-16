
import { useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Document } from "@/services/documents/types";
import { 
  WelcomeSection, 
  ProcessInfoCard, 
  DocumentsCard,
  PaymentCalendar
} from "@/components/dashboard";

const Dashboard = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchClientData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching client data for user ID:", user.id);
        
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (clientError) {
          console.error("Error fetching client info:", clientError);
          if (clientError.code === 'PGRST116') {
            toast.error("Não foi possível acessar os dados do cliente");
          } else {
            toast.error("Erro ao carregar informações do cliente");
          }
        } else if (clientData) {
          console.log("Client info found:", clientData);
          setClientInfo(clientData);
        }
        
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });
          
        if (documentsError) {
          console.error("Error fetching documents:", documentsError);
          if (documentsError.code === 'PGRST116') {
            toast.error("Não foi possível acessar seus documentos");
          } else {
            toast.error("Erro ao carregar documentos");
          }
        } else if (documentsData) {
          console.log("Documents found:", documentsData.length);
          setDocuments(documentsData);
        } else {
          setDocuments([]);
        }
        
      } catch (error) {
        console.error("Error fetching client data:", error);
        toast.error("Erro ao carregar dados do cliente");
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
      <WelcomeSection clientName={clientInfo?.full_name} />
      
      <div className="grid grid-cols-1 gap-4 mt-6">
        {/* Process Info and Calendar Section - Updated Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Process Info Card - Reduced width */}
          <div className="md:col-span-5">
            <ProcessInfoCard 
              processType={clientInfo?.process_type} 
              status={clientInfo?.status}
              startDate={clientInfo?.process_start_date}
              responsibleAgent={clientInfo?.responsible_agent}
              area={clientInfo?.service_area || "Imigração"}
            />
          </div>
          
          {/* Calendar and Payment Summary - Side by side layout */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Payment Calendar - Left side */}
              <div className="h-full">
                <PaymentCalendar />
              </div>
              
              {/* Payment Summary - Right side */}
              <div className="h-full">
                <div className="bg-card border rounded-md shadow-sm p-4 h-full flex flex-col">
                  <div className="flex items-center mb-3">
                    <h3 className="text-base font-medium">Resumo de Pagamentos</h3>
                  </div>
                  
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Próximo pagamento:</span>
                      <span className="font-medium">15/06/2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Valor:</span>
                      <span className="font-medium text-green-600">R$ 1.500,00</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Total aberto:</span>
                      <span className="font-semibold">R$ 4.500,00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Documents Section - Reduced top margin */}
        <div className="mt-1">
          <DocumentsCard documents={documents} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
