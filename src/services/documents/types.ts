
export interface Document {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  file_type: string | null;
  file_size: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentFormData {
  title: string;
  description?: string;
  client_id: string;
  status: string;
}
