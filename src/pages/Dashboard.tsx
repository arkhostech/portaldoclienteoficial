import MainLayout from "@/components/Layout/MainLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { useClientData } from "@/hooks/useClientData";
import ClientWelcomeSection from "@/components/dashboard/ClientWelcomeSection";
import StatsCards from "@/components/dashboard/StatsCards";
import ProcessInfoCard from "@/components/dashboard/ProcessInfoCard";
import DocumentsCard from "@/components/dashboard/DocumentsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/services/documents/types";
import { useAuth } from "@/contexts/auth";

const Dashboard = () => {
  const { clientData, clientStats, isLoading, error } = useClientData();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user } = useAuth();

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch recent documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!clientData || !user) return;

      try {
        setIsLoadingDocuments(true);
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("client_id", clientData.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching documents:", error);
          return;
        }

        setDocuments(data || []);
      } catch (err) {
        console.error("Unexpected error fetching documents:", err);
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, [clientData, user]);

  if (error) {
    return (
      <MainLayout title="Dashboard">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-center">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Connection Status Alert */}
        {!isOnline && (
          <Alert className="bg-amber-50 border-amber-200 text-amber-800">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Você está offline. Algumas funcionalidades podem estar limitadas.
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <ClientWelcomeSection clientData={clientData} isLoading={isLoading} />

        {/* Stats Cards */}
        <StatsCards stats={clientStats} isLoading={isLoading} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Process Information */}
            <ProcessInfoCard clientData={clientData} isLoading={isLoading} />

            {/* Documents Section */}
            <DocumentsCard documents={documents} />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Connection Status Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Conectado</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">Offline</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {isOnline 
                  ? "Todos os dados estão atualizados" 
                  : "Reconectando automaticamente..."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
