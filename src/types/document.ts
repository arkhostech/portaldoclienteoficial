
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
  uploaded_by?: 'admin' | 'client';
}

export interface DocumentFormData {
  title: string;
  description?: string;
  client_id: string;
}
