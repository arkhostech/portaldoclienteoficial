
export interface Client {
  id: string;
  name: string;
  email: string;
  process_type: string | null;
  date: string;
}

// This is just to fix the build error, will be unused
export interface Payment {
  id: string;
  client_name: string;
  title: string;
  value: string;
  due_date: string;
}
