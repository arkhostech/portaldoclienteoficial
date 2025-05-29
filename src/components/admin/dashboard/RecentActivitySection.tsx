
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
import { useActivityData } from "./hooks/useActivityData";
import { ClientsTab } from "./components/ClientsTab";

const RecentActivitySection = () => {
  const { newClients, isLoading } = useActivityData();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Atividades Recentes</h3>
      
      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="clients" className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            Novos Clientes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients">
          <ClientsTab 
            clients={newClients}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecentActivitySection;
