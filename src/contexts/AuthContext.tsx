
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, isAdmin?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Function to check if a user is an admin
  const checkIsAdmin = async (userId: string) => {
    try {
      // First try to get the user's metadata which might have the role
      const { data: userData } = await supabase.auth.getUser();
      const userRole = userData?.user?.user_metadata?.role;
      
      if (userRole === 'admin') {
        return true;
      }
      
      // If not found in metadata, try to get from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return false;
      }

      // Check if data has a role property, otherwise default to false
      return data?.role === 'admin' || false;
    } catch (err) {
      console.error("Error checking admin status:", err);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if user is admin
        if (session?.user) {
          const adminStatus = await checkIsAdmin(session.user.id);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
        
        // Always make sure loading state is updated after auth changes
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Getting existing session:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const adminStatus = await checkIsAdmin(session.user.id);
        setIsAdmin(adminStatus);
      }
      
      setLoading(false);
    })
    .catch(error => {
      console.error("Error getting session:", error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Get updated user data after login
      const { data: userData } = await supabase.auth.getUser();
      if (userData && userData.user) {
        const adminStatus = await checkIsAdmin(userData.user.id);
        
        toast.success("Login bem-sucedido!");
        
        // Redirect based on user role
        if (adminStatus) {
          navigate("/admin"); // Redirect admin to admin dashboard
        } else {
          navigate("/dashboard"); // Redirect client to client dashboard
        }
      }
    } catch (error: any) {
      toast.error(`Erro ao fazer login: ${error.message}`);
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, isAdmin = false) => {
    setLoading(true);
    try {
      console.log("Attempting to sign up user:", email, "Is Admin:", isAdmin);
      
      // Create the user with metadata including role
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: isAdmin ? "admin" : "client"
          }
        }
      });

      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error("Erro ao criar usuário");
      }
      
      // Cria um registro na tabela profiles apenas se o usuário foi criado com sucesso
      if (data.user && data.user.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              email: email,
              full_name: fullName,
              role: isAdmin ? 'admin' : 'client' 
            }
          ]);
          
        if (profileError) {
          console.error("Erro ao criar perfil:", profileError);
          // Não queremos lançar um erro aqui, pois o usuário já foi criado
          toast.error("Conta criada, mas houve um problema ao configurar o perfil.");
        }
      }
      
      toast.success("Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.");
      setLoading(false);
      
      // Não redirecionar automaticamente, deixar o usuário ver a mensagem de sucesso
    } catch (error: any) {
      console.error("Error details:", error);
      toast.error(`Erro ao criar conta: ${error.message}`);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate("/");
      toast.success("Desconectado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao desconectar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
