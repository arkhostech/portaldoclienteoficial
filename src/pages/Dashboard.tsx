
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
        
        // Primeiro tentamos pela tabela clients que é a tabela principal
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*, process_types(name)')
          .eq('id', user.id)
          .maybeSingle(); // Usamos maybeSingle em vez de single para evitar erro quando não há resultado
        
        if (clientError && clientError.code !== 'PGRST116') {
          console.error("Error fetching client info:", clientError);
          toast.error("Erro ao carregar informações do cliente");
        } 
        
        // Se não encontramos na tabela clients, buscamos na tabela profiles
        // para ter pelo menos as informações básicas do usuário
        if (!clientData) {
          console.log("Client not found in clients table, checking profiles");
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error("Error fetching profile info:", profileError);
          } else if (profileData) {
            console.log("Profile info found:", profileData);
            // Criamos um objeto com informações básicas do perfil
            // e status de documentação por padrão
            setClientInfo({
              ...profileData,
              status: "documentacao",
              process_type: "Não definido"
            });
          }
        } else {
          console.log("Client info found:", clientData);
          // Formatar o objeto clientInfo com o nome do tipo de processo
          const formattedClientInfo = {
            ...clientData,
            process_type: clientData.process_types?.name || "Não definido"
          };
          setClientInfo(formattedClientInfo);
        }
        
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });
          
        if (documentsError) {
          console.error("Error fetching documents:", documentsError);
          if (documentsError.code === 'PGRST116') {
            console.log("No documents found for this client");
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
        {/* Process Info Card - Full Width */}
        <div>
          <ProcessInfoCard 
            processType={clientInfo?.process_type} 
            status={clientInfo?.status}
            startDate={clientInfo?.process_start_date}
            responsibleAgent={clientInfo?.responsible_agent}
            area={clientInfo?.service_area || "Imigração"}
          />
        </div>
        
        {/* Documents and Calendar Cards - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Documents Card */}
          <div>
            <DocumentsCard documents={documents} />
          </div>
          
          {/* Payment Calendar */}
          <div>
            <PaymentCalendar showFullCalendar={true} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
