
export interface Document {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
  status: string;
  uploaded_by: 'admin' | 'client';
}

export interface DocumentFormData {
  title: string;
  description?: string;
  client_id: string;
}

// New interface for client-side document display
export interface ClientDocumentView {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  needsSignature: boolean;
  signed: boolean;
  filePath: string | null;
}
