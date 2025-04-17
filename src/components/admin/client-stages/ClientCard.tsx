
import { useDrag } from "react-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Client } from "@/services/clients/types";
import { ItemTypes, ClientDragItem } from "./ItemTypes";
import { format } from "date-fns";

interface ClientCardProps {
  client: Client;
}

const ClientCard = ({ client }: ClientCardProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CLIENT_CARD,
    item: { 
      id: client.id,
      currentStatus: client.status 
    } as ClientDragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="mb-3 cursor-grab active:cursor-grabbing"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Card className="border shadow-sm hover:shadow transition-shadow">
        <CardContent className="p-4">
          <h4 className="font-medium text-base mb-1">{client.full_name}</h4>
          {client.process_type && (
            <p className="text-sm text-muted-foreground mb-2">{client.process_type}</p>
          )}
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <span>
              Atualizado: {format(new Date(client.updated_at), 'dd/MM/yyyy')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientCard;
