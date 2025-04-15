
export interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: string;
  process_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  process_type: string;
}

export interface ClientWithAuthFormData extends ClientFormData {
  password: string;
}
