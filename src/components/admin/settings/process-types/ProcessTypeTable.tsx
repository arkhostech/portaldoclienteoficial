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
      <div 
        className="text-center py-8 rounded-md"
        style={{ 
          backgroundColor: 'rgba(163, 204, 171, 0.1)',
          borderRadius: '8px'
        }}
      >
        <p style={{ color: '#34675C' }}>
          Nenhum tipo de processo cadastrado
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow style={{ borderBottomColor: '#e5e7eb' }}>
          <TableHead style={{ color: '#14140F', fontWeight: 600 }}>
            Nome do Processo
          </TableHead>
          <TableHead className="text-right" style={{ color: '#14140F', fontWeight: 600 }}>
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {processTypes.map((process) => (
          <TableRow 
            key={process.id}
            style={{ borderBottomColor: '#f3f4f6' }}
            className="hover:bg-gray-50"
          >
            <TableCell style={{ color: '#14140F' }}>
              {editingProcess?.id === process.id ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                  className="focus:border-[#053D38]"
                  style={{
                    borderColor: '#e5e7eb',
                  }}
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
                    style={{
                      color: '#34675C',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = 'rgba(163, 204, 171, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={confirmEdit}
                    disabled={isSubmitting || !editValue.trim()}
                    style={{
                      color: '#053D38',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = 'rgba(5, 61, 56, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = 'transparent';
                    }}
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
                    style={{
                      color: '#34675C',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = 'rgba(163, 204, 171, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(process)}
                    disabled={isSubmitting}
                    style={{
                      color: '#dc2626',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = 'transparent';
                    }}
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
