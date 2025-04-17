
import { Client } from "@/services/clients/types";

export type StageColumnType = 'documentacao' | 'em_andamento' | 'concluido' | 'sem_estagio';

export interface ClientDragItem {
  id: string;
  client: Client;
  type: string;
}

export interface StageColumnProps {
  title: string;
  type: StageColumnType;
  clients: Client[];
  onDragStart: (client: Client) => void;
  onDrop: (clientId: string, newStatus: StageColumnType) => void;
}
