
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { useAuth } from "@/contexts/auth";
import { useActivityData } from "@/components/admin/dashboard/hooks/useActivityData";
import AdminDashboardSummary from "@/components/admin/dashboard/AdminDashboardSummary";
import RecentActivitySection from "@/components/admin/dashboard/RecentActivitySection";
import VisualizationSection from "@/components/admin/dashboard/VisualizationSection";

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { newClients, isLoading } = useActivityData();

  useEffect(() => {
    // If not admin and auth is complete, redirect to client dashboard
    if (!loading && user && !isAdmin) {
      navigate("/dashboard");
    }
  }, [user, isAdmin, navigate, loading]);

  // Don't attempt to render the dashboard until we know the user is an admin
  if (loading) {
    return (
      <MainLayout title="Admin Dashboard">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // If not logged in or not admin, display nothing (redirect will happen)
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <MainLayout title="Admin Dashboard">
      <div className="flex-1 space-y-4">
        <AdminDashboardSummary />
        <VisualizationSection />
        <RecentActivitySection />
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
