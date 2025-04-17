
import { useDrop } from "react-dnd";
import { ItemTypes, ClientDragItem } from "./ItemTypes";
import { ProcessStatus } from "@/services/clients/types";
import { cn } from "@/lib/utils";

interface StageColumnProps {
  title: string;
  status: ProcessStatus;
  onDrop: (clientId: string, status: ProcessStatus) => void;
  children: React.ReactNode;
}

const StageColumn = ({ title, status, onDrop, children }: StageColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CLIENT_CARD,
    drop: (item: ClientDragItem) => {
      console.log(`StageColumn - Dropped item:`, item);
      console.log(`StageColumn - Target status:`, status);
      onDrop(item.id, status);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // Define different background colors for each status
  const getStatusColor = () => {
    switch (status) {
      case "documentacao":
        return isOver ? "bg-blue-50" : "bg-blue-25";
      case "em_andamento":
        return isOver ? "bg-amber-50" : "bg-amber-25";
      case "concluido":
        return isOver ? "bg-green-50" : "bg-green-25";
      default:
        return isOver ? "bg-gray-100" : "bg-gray-50";
    }
  };

  return (
    <div className="flex flex-col h-full min-w-[320px]">
      <div className="mb-4 text-center">
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div
        ref={drop}
        className={cn(
          "flex-1 p-4 rounded-lg border",
          getStatusColor(),
          "overflow-y-auto max-h-[calc(100vh-240px)]"
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default StageColumn;
