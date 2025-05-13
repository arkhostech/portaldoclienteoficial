
export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'admin' | 'client';
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  client_id: string;
  process_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  client?: {
    full_name: string;
    email: string;
    phone: string | null;
    status: string;
    process_type_id: string | null;
  };
}
