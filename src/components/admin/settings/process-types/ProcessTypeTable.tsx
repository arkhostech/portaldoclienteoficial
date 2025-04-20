
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProcessType {
  id: string;
  name: string;
}

interface ProcessTypeTableProps {
  processTypes: ProcessType[];
  onEdit: (id: string, name: string) => void;
  onDelete: (process: ProcessType) => void;
  isSubmitting: boolean;
}

export const ProcessTypeTable = ({ 
  processTypes, 
  onEdit, 
  onDelete,
  isSubmitting 
}: ProcessTypeTableProps) => {
  const [editingProcess, setEditingProcess] = useState<ProcessType | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEditing = (process: ProcessType) => {
    setEditingProcess(process);
    setEditValue(process.name);
  };

  const cancelEditing = () => {
    setEditingProcess(null);
    setEditValue("");
  };

  const confirmEdit = () => {
    if (!editingProcess) return;
    if (!editValue.trim()) {
      toast.error("Nome do processo não pode estar vazio");
      return;
    }

    onEdit(editingProcess.id, editValue.trim());
    setEditingProcess(null);
  };

  if (processTypes.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-md">
        <p className="text-muted-foreground">Nenhum tipo de processo cadastrado</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nome do Processo</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {processTypes.map((process) => (
          <TableRow key={process.id}>
            <TableCell className="font-medium">{process.id}</TableCell>
            <TableCell>
              {editingProcess?.id === process.id ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                />
              ) : (
                process.name
              )}
            </TableCell>
            <TableCell className="text-right">
              {editingProcess?.id === process.id ? (
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditing}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={confirmEdit}
                    disabled={isSubmitting || !editValue.trim()}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing(process)}
                    disabled={isSubmitting}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(process)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
