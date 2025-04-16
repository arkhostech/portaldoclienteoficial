
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
        {/* Process Info and Calendar Section - Adjusted Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Process Info Card - 2/3 width on medium+ screens */}
          <div className="md:col-span-2">
            <ProcessInfoCard 
              processType={clientInfo?.process_type} 
              status={clientInfo?.status}
              startDate={clientInfo?.process_start_date}
              responsibleAgent={clientInfo?.responsible_agent}
              area={clientInfo?.service_area || "Imigração"}
            />
          </div>
          
          {/* Payment Calendar - 1/3 width on medium+ screens */}
          <div className="md:col-span-1">
            <PaymentCalendar />
          </div>
        </div>
        
        {/* Documents Section - Reduced top margin */}
        <div className="mt-2">
          <DocumentsCard documents={documents} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
