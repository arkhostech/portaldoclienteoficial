
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced function to check if a user is an admin
  const checkUserRole = async (userId: string): Promise<'admin' | 'client' | null> => {
    try {
      // First check app_metadata from auth user
      const { data: userData } = await supabase.auth.getUser();
      const userRole = userData?.user?.app_metadata?.role;
      
      if (userRole === 'admin') {
        return 'admin';
      } else if (userRole === 'client') {
        return 'client';
      }
      
      // Then check profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data?.role || null;
    } catch (err) {
      console.error("Error checking user role:", err);
      return null;
    }
  };

  // Determine if the current path is in the admin section
  const isAdminPath = (path: string): boolean => {
    return path === '/admin-login' || path.startsWith('/admin');
  };

  // Determine if the current path is in the client section
  const isClientPath = (path: string): boolean => {
    return path === '/' || path === '/dashboard' || 
           path === '/documents' || path === '/payments' || 
           path === '/knowledge';
  };

  // Authentication actions
  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // The navigation and role check will be handled in the onAuthStateChange
      toast.success("Login bem-sucedido!");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Erro ao fazer login: ${error.message}`);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect based on current path
      if (isAdminPath(location.pathname)) {
        navigate("/admin-login");
      } else {
        navigate("/");
      }
      
      toast.success("Desconectado com sucesso!");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(`Erro ao desconectar: ${error.message}`);
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log("AuthProvider: Initializing");
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        
        if (!mounted) return;
        
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          
          // Use setTimeout to avoid potential deadlocks
          setTimeout(async () => {
            if (mounted && newSession.user) {
              const userRole = await checkUserRole(newSession.user.id);
              const isUserAdmin = userRole === 'admin';
              setIsAdmin(isUserAdmin);
              setLoading(false);
              
              // Navigation based on role and event
              if (event === 'SIGNED_IN') {
                // Check if user is on the correct login page
                const currentPath = window.location.pathname;
                
                // Handle admin login page
                if (currentPath === '/admin-login') {
                  if (!isUserAdmin) {
                    // Admin login page but user is not admin
                    toast.error("Apenas administradores podem acessar este portal.");
                    await signOut();
                    return;
                  } else {
                    // Admin logged into admin login page - redirect to admin dashboard
                    navigate("/admin");
                    return;
                  }
                } 
                
                // Handle client login page
                if (currentPath === '/') {
                  if (isUserAdmin) {
                    // Client login page but user is admin
                    toast.error("Administradores devem acessar pelo portal administrativo.");
                    await signOut();
                    return;
                  } else {
                    // Client logged into client login page - redirect to client dashboard
                    navigate("/dashboard");
                    return;
                  }
                }
                
                // If already on some path, check if it's appropriate for the role
                if (isAdminPath(currentPath) && !isUserAdmin) {
                  toast.error("Apenas administradores podem acessar este portal.");
                  await signOut();
                  return;
                }
                
                if (isClientPath(currentPath) && isUserAdmin) {
                  toast.error("Administradores devem acessar pelo portal administrativo.");
                  await signOut();
                  return;
                }
              }
            }
          }, 0);
        } else {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking existing session");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session) {
          console.log("Found existing session for user:", session.user.id);
          setSession(session);
          setUser(session.user);
          
          const userRole = await checkUserRole(session.user.id);
          const isUserAdmin = userRole === 'admin';
          
          if (mounted) {
            setIsAdmin(isUserAdmin);
            setLoading(false);
            
            // Check if user is on the correct page based on role
            const currentPath = window.location.pathname;
            
            // Redirect if on wrong section
            if (isAdminPath(currentPath) && !isUserAdmin) {
              // Admin page but user is not admin
              toast.error("Apenas administradores podem acessar este portal.");
              await signOut();
              return;
            } 
            
            if (isClientPath(currentPath) && isUserAdmin) {
              // Client page but user is admin
              toast.error("Administradores devem acessar pelo portal administrativo.");
              await signOut();
              return;
            }
            
            // If on login page, redirect to appropriate dashboard
            if (currentPath === '/admin-login' && isUserAdmin) {
              navigate('/admin');
              return;
            }
            
            if (currentPath === '/' && !isUserAdmin) {
              navigate('/dashboard');
              return;
            }
          }
        } else {
          // Handle not logged in - redirect to appropriate login page if trying to access protected path
          const currentPath = window.location.pathname;
          
          if (isAdminPath(currentPath) && currentPath !== '/admin-login') {
            navigate('/admin-login');
            return;
          }
          
          if (isClientPath(currentPath) && currentPath !== '/') {
            navigate('/');
            return;
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      console.log("AuthProvider: Cleaning up");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const value = {
    user,
    session,
    signIn,
    signOut,
    loading,
    isAdmin
  };
  
  console.log("Auth state:", { user: !!user, loading, isAdmin, path: location.pathname });
  
  return (
    <AuthContext.Provider value={value}>
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
