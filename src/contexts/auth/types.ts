
import { User, Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null | false;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
}
