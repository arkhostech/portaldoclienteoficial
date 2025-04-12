
import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, checkUserRoleWithCache, clearUserRoleCache } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { isAdminPath, isClientPath } from "./utils";
import { AuthContextType } from "./types";

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionChecked, setSessionChecked] = useState(false);

  // Memoized function to check user role - avoids unnecessary database queries
  const checkUserRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const userRole = await checkUserRoleWithCache(userId);
      return userRole === 'admin';
    } catch (error) {
      console.error("Error checking user role:", error);
      return false;
    }
  }, []);

  // Authentication actions
  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success("Login bem-sucedido!");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Erro ao fazer login: ${error.message}`);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear cached data for the current user
      if (user) {
        clearUserRoleCache(user.id);
      }
      
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
              const isUserAdmin = await checkUserRole(newSession.user.id);
              setIsAdmin(isUserAdmin);
              
              if (event === 'SIGNED_IN') {
                // Only handle navigation for SIGNED_IN event, not for SESSION_REFRESHED
                const currentPath = window.location.pathname;
                
                if (currentPath === '/admin-login') {
                  if (!isUserAdmin) {
                    toast.error("Apenas administradores podem acessar este portal.");
                    await signOut();
                    return;
                  } else {
                    navigate("/admin");
                    return;
                  }
                } 
                
                if (currentPath === '/') {
                  if (isUserAdmin) {
                    toast.error("Administradores devem acessar pelo portal administrativo.");
                    await signOut();
                    return;
                  } else {
                    navigate("/dashboard");
                    return;
                  }
                }
                
                // Path validation for SIGNED_IN only
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
              setLoading(false);
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

    // THEN check for existing session (only once)
    if (!sessionChecked) {
      const checkSession = async () => {
        try {
          console.log("Checking existing session");
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!mounted) return;
          
          if (session) {
            console.log("Found existing session for user:", session.user.id);
            setSession(session);
            setUser(session.user);
            
            const isUserAdmin = await checkUserRole(session.user.id);
            
            if (mounted) {
              setIsAdmin(isUserAdmin);
              setLoading(false);
              
              // Only redirect if on login pages or wrong section
              const currentPath = window.location.pathname;
              
              // Don't redirect on page refresh if already in correct section
              // Only redirect if trying to access wrong section
              if (isAdminPath(currentPath) && !isUserAdmin && currentPath !== '/admin-login') {
                toast.error("Apenas administradores podem acessar este portal.");
                await signOut();
                return;
              } 
              
              if (isClientPath(currentPath) && isUserAdmin && currentPath !== '/') {
                toast.error("Administradores devem acessar pelo portal administrativo.");
                await signOut();
                return;
              }
              
              // Redirect if on login pages only
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
        setSessionChecked(true);
      };

      checkSession();
    }

    return () => {
      console.log("AuthProvider: Cleaning up");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, sessionChecked, checkUserRole, signOut]);

  const value = {
    user,
    session,
    signIn,
    signOut,
    loading,
    isAdmin
  };
  
  console.log("Auth state:", { user: !!user, loading, isAdmin, path: location.pathname });
  
  return value;
}
