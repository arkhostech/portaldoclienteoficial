import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { Client } from "@/services/clientService";
import { useEffect, useState } from "react";
import { checkClientRelatedEntities } from "@/services/clients/deleteClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteClientModalProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string, cascade?: boolean) => Promise<boolean>;
  isSubmitting: boolean;
}

interface RelatedEntities {
  documents: number;
  conversations: number;
  scheduledPayments: number;
}

const DeleteClientModal = ({
  client,
  open,
  onOpenChange,
  onConfirm,
  isSubmitting
}: DeleteClientModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingRelations, setIsCheckingRelations] = useState(false);
  const [relatedEntities, setRelatedEntities] = useState<RelatedEntities | null>(null);
  const [showCascadeWarning, setShowCascadeWarning] = useState(false);
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsDeleting(false);
      setIsCheckingRelations(false);
      setRelatedEntities(null);
      setShowCascadeWarning(false);
    }
  }, [open]);

  // Check for related entities when modal opens
  useEffect(() => {
    if (open && client && !relatedEntities) {
      checkRelatedEntities();
    }
  }, [open, client]);

  const checkRelatedEntities = async () => {
    if (!client) return;

    setIsCheckingRelations(true);
    try {
      const entities = await checkClientRelatedEntities(client.id);
      setRelatedEntities(entities);
      
      // Show cascade warning if there are related entities
      const hasRelatedData = entities.documents > 0 || entities.conversations > 0 || entities.scheduledPayments > 0;
      setShowCascadeWarning(hasRelatedData);
    } catch (error) {
      console.error("Error checking related entities:", error);
    } finally {
      setIsCheckingRelations(false);
    }
  };

  const handleDelete = async (cascade = false) => {
    if (!client) return;
    
    try {
      setIsDeleting(true);
      const success = await onConfirm(client.id, cascade);
      
      if (success) {
        // Use a longer timeout to ensure all state updates have propagated
        setTimeout(() => {
          setIsDeleting(false);
          onOpenChange(false);
        }, 300);
      } else {
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      setIsDeleting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    // Only allow closing if we're not in the middle of a deletion
    if (!open && !isSubmitting && !isDeleting && !isCheckingRelations) {
      onOpenChange(open);
    }
  };

  const getRelatedEntitiesDescription = () => {
    if (!relatedEntities) return "";

    const items = [];
    if (relatedEntities.documents > 0) {
      items.push(`${relatedEntities.documents} documento(s)`);
    }
    if (relatedEntities.conversations > 0) {
      items.push(`${relatedEntities.conversations} conversa(s)`);
    }
    if (relatedEntities.scheduledPayments > 0) {
      items.push(`${relatedEntities.scheduledPayments} pagamento(s) agendado(s)`);
    }

    return items.join(", ");
  };

  const isLoading = isSubmitting || isDeleting || isCheckingRelations;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            {isCheckingRelations ? (
              "Verificando dados relacionados..."
            ) : showCascadeWarning ? (
              <>
                O cliente <strong>{client?.full_name}</strong> possui dados associados que também serão excluídos:
              </>
            ) : (
              <>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente 
                {client && ` "${client.full_name}"`}.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {showCascadeWarning && relatedEntities && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Dados que serão excluídos:</strong>
              <br />
              {getRelatedEntitiesDescription()}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={() => handleDialogClose(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          
          {showCascadeWarning ? (
            <Button 
              variant="destructive" 
              onClick={() => handleDelete(true)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir Tudo
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              onClick={() => handleDelete(false)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteClientModal;
