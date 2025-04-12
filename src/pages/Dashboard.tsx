
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
  QuickActionsCard,
  PaymentCalendar
} from "@/components/dashboard";

const Dashboard = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch real client data from the database
  useEffect(() => {
    if (!user) return;

    const fetchClientData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching client data for user ID:", user.id);
        
        // Fetch client info - RLS will ensure this only returns the client's own data
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (clientError) {
          console.error("Error fetching client info:", clientError);
          if (clientError.code === 'PGRST116') {
            // No rows returned - this is an access error or data not found
            toast.error("Não foi possível acessar os dados do cliente");
          } else {
            toast.error("Erro ao carregar informações do cliente");
          }
        } else if (clientData) {
          console.log("Client info found:", clientData);
          setClientInfo(clientData);
        }
        
        // Fetch client's documents
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
      {/* Welcome section */}
      <WelcomeSection clientName={clientInfo?.full_name} />
      
      {/* Responsive grid layout - adjusted for better spacing on all screen sizes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mt-6">
        {/* Main content - left column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4 md:space-y-6">
          {/* Process information */}
          <ProcessInfoCard 
            processType={clientInfo?.process_type} 
            status={clientInfo?.status}
            startDate={clientInfo?.process_start_date}
            responsibleAgent={clientInfo?.responsible_agent}
            lastUpdate={clientInfo?.last_update_date || clientInfo?.updated_at}
          />

          {/* Documents section */}
          <DocumentsCard documents={documents} />
        </div>
        
        {/* Right sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 md:space-y-6">
          {/* Calendar for payment reminders - made more responsive */}
          <PaymentCalendar />
          
          {/* Quick actions */}
          <QuickActionsCard />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
