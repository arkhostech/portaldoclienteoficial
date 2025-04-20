
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types/activity";
import { LoadingState, EmptyState } from "./SharedStates";
import { formatDate } from "../utils/dateFormat";

interface ClientsTabProps {
  clients: Client[];
  isLoading: boolean;
}

export const ClientsTab = ({ clients, isLoading }: ClientsTabProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Novos Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : clients.length === 0 ? (
          <EmptyState message="Nenhum cliente recente encontrado" />
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <h4 className="font-medium">{client.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {client.process_type || "Processo não definido"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Adicionado em {formatDate(client.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
