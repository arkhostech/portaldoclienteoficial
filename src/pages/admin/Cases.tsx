
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import CasesHeader from "@/components/admin/cases/CasesHeader";
import ProcessAccordion from "@/components/admin/cases/ProcessAccordion";
import CasesSearch from "@/components/admin/cases/CasesSearch";
import { useClients } from "@/hooks/useClients";
import { useClientGroups } from "@/hooks/useClientGroups";

const Cases = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { clients, isLoading } = useClients();
  const { searchTerm, setSearchTerm, filteredGroups } = useClientGroups(clients);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);

  return (
    <MainLayout title="Processos">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
          <CasesHeader />
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <CasesSearch value={searchTerm} onChange={setSearchTerm} />
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              Novo Processo
            </Button>
          </div>
        </div>

        <ProcessAccordion 
          groups={filteredGroups}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  );
};

export default Cases;
