
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
      <Card 
        className="mb-3 transition-all duration-200 bg-white"
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <CardHeader className="p-3 pb-0">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm" style={{ color: '#14140F' }}>{client.full_name}</h3>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="text-xs space-y-1.5">
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" style={{ color: '#34675C' }} />
              <span style={{ color: '#34675C' }}>{client.email}</span>
            </div>
            {client.process_type && (
              <div className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" style={{ color: '#34675C' }} />
                <span style={{ color: '#34675C' }}>{client.process_type}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" style={{ color: '#34675C' }} />
              <span style={{ color: '#34675C' }}>Cadastrado em: {createdDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientCard;
