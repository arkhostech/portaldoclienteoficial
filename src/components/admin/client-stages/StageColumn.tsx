
import { useDrop } from 'react-dnd';
import { StageColumnProps, ClientDragItem, StageColumnType } from './types';
import ClientCard from './ClientCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, HelpCircle } from 'lucide-react';

const StageColumn = ({ 
  title, 
  type, 
  clients, 
  onDragStart, 
  onDrop 
}: StageColumnProps) => {
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CLIENT',
    drop: (item: ClientDragItem) => {
      console.log(`Dropping client ${item.id} into ${type} column`);
      onDrop(item.id, type);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const getIcon = () => {
    switch (type) {
      case 'documentacao':
        return <FileText className="h-4 w-4 mr-1" />;
      case 'em_andamento':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'concluido':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'sem_estagio':
        return <HelpCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case 'documentacao':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'concluido':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'sem_estagio':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return '';
    }
  };

  return (
    <Card 
      className={`h-full ${isOver ? 'bg-muted/30' : ''}`}
      ref={drop}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge className={getBadgeColor()}>
            <div className="flex items-center">
              {getIcon()}
              <span>{clients.length}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hidden">
        {clients.length > 0 ? (
          clients.map((client) => (
            <ClientCard 
              key={client.id} 
              client={client} 
              onDragStart={onDragStart} 
            />
          ))
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Nenhum cliente neste estágio
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StageColumn;
