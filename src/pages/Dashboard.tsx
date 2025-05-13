
import MainLayout from "@/components/Layout/MainLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { 
  WelcomeSection, 
  ProcessInfoCard, 
  DocumentsCard, 
  MeetingsCard 
} from "@/components/dashboard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/document";

const Dashboard = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processType, setProcessType] = useState<string | undefined>(undefined);
  const [processStatus, setProcessStatus] = useState<"documentacao" | "em_andamento" | "concluido">("documentacao");

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch client data
        const { data: clientData } = await supabase
          .from('clients')
          .select('process_type_id, status')
          .eq('id', user.id)
          .single();
          
        if (clientData) {
          // If process_type_id exists, fetch the process type name
          if (clientData.process_type_id) {
            const { data: processTypeData } = await supabase
              .from('process_types')
              .select('name')
              .eq('id', clientData.process_type_id)
              .single();
              
            if (processTypeData) {
              setProcessType(processTypeData.name);
            }
          }
          
          // Set process status
          if (clientData.status === "pending") {
            setProcessStatus("documentacao");
          } else if (clientData.status === "in_progress" || clientData.status === "active") {
            setProcessStatus("em_andamento");
          } else if (clientData.status === "completed") {
            setProcessStatus("concluido");
          }
        }
        
        // Fetch recent documents
        const { data: docs } = await supabase
          .from('documents')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (docs) {
          setDocuments(docs);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClientData();
  }, [user]);

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {user && <WelcomeSection clientName={user.user_metadata?.full_name || user.email} />}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProcessInfoCard 
              processType={processType} 
              status={processStatus} 
              startDate={user?.created_at} 
              responsibleAgent="Legacy Imigra"
              area="Imigração"
            />
          </div>
          
          <div className="lg:col-span-1">
            <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle>Bem-vindo(a) ao Portal Legacy</AlertTitle>
              <AlertDescription>
                Aqui você pode acompanhar seu processo e gerenciar seus documentos.
              </AlertDescription>
            </Alert>
          </div>
          
          <div className="lg:col-span-2">
            <DocumentsCard documents={documents} />
          </div>
          
          <div className="lg:col-span-1">
            <MeetingsCard />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
