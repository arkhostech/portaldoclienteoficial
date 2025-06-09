import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { useAuth } from "@/contexts/auth";
import AdminDashboardSummary from "@/components/admin/dashboard/AdminDashboardSummary";
import VisualizationSection from "@/components/admin/dashboard/VisualizationSection";
import { TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not admin, redirect to client dashboard
    if (user && !isAdmin) {
      navigate("/dashboard");
    }
  }, [user, isAdmin, navigate]);

  return (
    <MainLayout title="Dashboard">
      <div className="flex-1 space-y-8">
        {/* Stats Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">Resumo Executivo</h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <AdminDashboardSummary />
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <VisualizationSection />
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
