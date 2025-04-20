
export interface Payment {
  id: string;
  client_name: string;
  title: string;
  value: string;
  due_date: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  process_type_id: string | null;
  date: string;
}
