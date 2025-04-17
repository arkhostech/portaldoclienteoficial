
import { useDrag } from 'react-dnd';
import { Client } from '@/services/clients/types';
import { User, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ClientDragItem } from './types';

interface ClientCardProps {
  client: Client;
  onDragStart: (client: Client) => void;
}

const ClientCard = ({ client, onDragStart }: ClientCardProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CLIENT',
    item: () => {
      console.log(`Dragging client with ID: ${client.id}`);
      onDragStart(client);
      const dragItem: ClientDragItem = {
        id: client.id,
        client: client,
        type: 'CLIENT'
      };
      return dragItem;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const createdDate = new Date(client.created_at).toLocaleDateString('pt-BR');

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} className="cursor-grab">
      <Card className="mb-3 hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-0">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm">{client.full_name}</h3>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="text-xs space-y-1.5 text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>{client.email}</span>
            </div>
            {client.process_type && (
              <div className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                <span>{client.process_type}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Cadastrado em: {createdDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientCard;
