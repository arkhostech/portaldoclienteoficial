
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
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { newClients, isLoading } = useActivityData();

  useEffect(() => {
    // If not admin, redirect to client dashboard
    if (user && !isAdmin) {
      navigate("/dashboard");
    }
  }, [user, isAdmin, navigate]);

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
