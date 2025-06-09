
import { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { useAuth } from "@/contexts/auth";

import AdminDashboardSummary from "@/components/admin/dashboard/AdminDashboardSummary";

import VisualizationSection from "@/components/admin/dashboard/VisualizationSection";

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
    <MainLayout title="Admin Dashboard">
      <div className="flex-1 space-y-4">
        <AdminDashboardSummary />
        <VisualizationSection />

      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
