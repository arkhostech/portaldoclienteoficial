
import { Client } from "@/services/clientService";

export interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

export interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (data: { title?: string; description?: string; client_id: string; file: File }) => Promise<boolean>;
  isSubmitting: boolean;
  clients: Client[];
  preSelectedClientId?: string;
}
