import MainLayout from "@/components/Layout/MainLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, WifiOff } from "lucide-react";
import { useClientData } from "@/hooks/useClientData";
import StatsCards from "@/components/dashboard/StatsCards";
import ProcessInfoCard from "@/components/dashboard/ProcessInfoCard";
import QuickActions from "@/components/dashboard/QuickActions";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const { clientData, clientStats, isLoading, error } = useClientData();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  // Create dynamic title with client name
  const getTitle = () => {
    if (isLoading) {
      return "Dashboard";
    }
    if (clientData) {
      const firstName = clientData.full_name.split(' ')[0];
      return `Olá, ${firstName}! 👋`;
    }
    return "Dashboard";
  };

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
    <MainLayout title={getTitle()}>
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

        {/* Process Information */}
        <ProcessInfoCard clientData={clientData} isLoading={isLoading} />

        {/* Stats Cards */}
        <StatsCards stats={clientStats} isLoading={isLoading} />

        {/* Quick Actions */}
        <QuickActions />

      </div>
    </MainLayout>
  );
};

export default Dashboard;
