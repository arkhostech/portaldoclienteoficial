
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
      default:
        return null;
    }
  };

  const getHeaderStyle = () => {
    switch (type) {
      case 'documentacao':
        return { backgroundColor: '#053D38', color: 'white' };
      case 'em_andamento':
        return { backgroundColor: '#F26800', color: 'white' };
      case 'concluido':
        return { backgroundColor: '#A3CCAB', color: '#14140F' };
      default:
        return {};
    }
  };

  const getBadgeStyle = () => {
    switch (type) {
      case 'documentacao':
        return { backgroundColor: '#34675C', color: 'white' };
      case 'em_andamento':
        return { backgroundColor: '#14140F', color: 'white' };
      case 'concluido':
        return { backgroundColor: '#34675C', color: 'white' };
      default:
        return {};
    }
  };

  const getBorderStyle = () => {
    switch (type) {
      case 'documentacao':
        return { borderLeft: '4px solid #053D38' };
      case 'em_andamento':
        return { borderLeft: '4px solid #F26800' };
      case 'concluido':
        return { borderLeft: '4px solid #A3CCAB' };
      default:
        return {};
    }
  };

  return (
    <Card 
      className={`h-full ${isOver ? 'bg-muted/30' : ''}`}
      style={getBorderStyle()}
      ref={drop}
    >
      <CardHeader className="pb-2" style={getHeaderStyle()}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge className="border-0" style={getBadgeStyle()}>
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

