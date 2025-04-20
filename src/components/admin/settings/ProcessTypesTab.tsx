import { useState } from "react";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { toast } from "sonner";

interface ProcessType {
  id: string;
  name: string;
}

const ProcessTypesTab = () => {
  const { processTypes, isLoading, isSubmitting, addProcessType, updateProcessType, deleteProcessType } = useProcessTypes();
  const [newProcessType, setNewProcessType] = useState("");
  const [editingProcess, setEditingProcess] = useState<ProcessType | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<ProcessType | null>(null);

  const handleAddProcess = () => {
    if (!newProcessType.trim()) {
      toast.error("Nome do processo não pode estar vazio");
      return;
    }

    addProcessType(newProcessType.trim());
    setNewProcessType("");
  };

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

    updateProcessType({ id: editingProcess.id, name: editValue.trim() });
    setEditingProcess(null);
  };

  const openDeleteDialog = (process: ProcessType) => {
    setProcessToDelete(process);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!processToDelete) return;
    deleteProcessType(processToDelete.id);
    setDeleteConfirmOpen(false);
    setProcessToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1">
          <label htmlFor="new-process" className="text-sm font-medium leading-none mb-2 block">
            Novo Tipo de Processo
          </label>
          <div className="flex gap-2">
            <Input
              id="new-process"
              value={newProcessType}
              onChange={(e) => setNewProcessType(e.target.value)}
              placeholder="Nome do processo"
            />
            <Button
              onClick={handleAddProcess}
              disabled={isSubmitting || !newProcessType.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>
      </div>

      {processTypes.length > 0 ? (
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
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={confirmEdit}
                        disabled={!editValue.trim()}
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDeleteDialog(process)}
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
      ) : (
        <div className="text-center py-8 bg-muted/30 rounded-md">
          <p className="text-muted-foreground">Nenhum tipo de processo cadastrado</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o processo "{processToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProcessTypesTab;
