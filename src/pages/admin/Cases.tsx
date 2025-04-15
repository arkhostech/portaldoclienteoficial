
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilePlus, Search } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import CasesHeader from "@/components/admin/cases/CasesHeader";
import ProcessAccordion from "@/components/admin/cases/ProcessAccordion";
import { Client } from "@/services/clients/types";
import { useClients } from "@/hooks/useClients";

const Cases = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { clients, isLoading } = useClients();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);

  // Filter and group clients by process type
  const groupedClients = clients.reduce((acc: { [key: string]: Client[] }, client) => {
    const processType = client.process_type || "Other";
    if (!acc[processType]) {
      acc[processType] = [];
    }
    acc[processType].push(client);
    return acc;
  }, {});

  // Filter based on search term
  const filteredGroups = Object.entries(groupedClients)
    .map(([type, clients]) => ({
      type,
      clients: clients.filter(client =>
        client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(group => group.clients.length > 0);

  return (
    <MainLayout title="Processos">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
          <CasesHeader />
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar processo..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
