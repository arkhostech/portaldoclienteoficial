import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";

// Import refactored components
import ReportHeader from "@/components/admin/reports/ReportHeader";
import SummaryCards from "@/components/admin/reports/SummaryCards";
import MonthlyChart from "@/components/admin/reports/MonthlyChart";
import ProcessTypeChart from "@/components/admin/reports/ProcessTypeChart";
import ProcessStatusChart from "@/components/admin/reports/ProcessStatusChart";
import LawyerPerformanceTable from "@/components/admin/reports/LawyerPerformanceTable";

const Reports = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mensal");

  // Redirect non-admin users
  if (!isAdmin) {
    navigate("/dashboard");
    return null;
  }

  return (
    <MainLayout title="Relatórios">
      <div className="space-y-6">
        <ReportHeader />
        <SummaryCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProcessTypeChart />
          <ProcessStatusChart />
        </div>

        <LawyerPerformanceTable />
      </div>
    </MainLayout>
  );
};

export default Reports;
