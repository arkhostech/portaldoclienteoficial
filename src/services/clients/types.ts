
export interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: ProcessStatus;
  process_type_id: string | null;
  process_type?: string | null; // Virtual property to store process type name
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  full_name: string;
  email: string;
  phone?: string;
  status: ProcessStatus;
  process_type: string;
}

export interface ClientWithAuthFormData extends ClientFormData {
  password: string;
}

export type ProcessStatus = "documentacao" | "em_andamento" | "concluido";
