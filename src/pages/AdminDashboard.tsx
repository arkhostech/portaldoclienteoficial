
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { useAuth } from "@/contexts/auth";
import AdminDashboardSummary from "@/components/admin/dashboard/AdminDashboardSummary";
import RecentActivitySection from "@/components/admin/dashboard/RecentActivitySection";
import VisualizationSection from "@/components/admin/dashboard/VisualizationSection";

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <MainLayout title="Painel Administrativo">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold">Painel Administrativo</h2>
          <p className="text-muted-foreground">
            Visão geral do escritório e atividades recentes
          </p>
        </div>

        {/* Summary Cards */}
        <AdminDashboardSummary />

        {/* Visualization Section - Charts */}
        <VisualizationSection />

        {/* Recent Activity Section */}
        <RecentActivitySection />
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
