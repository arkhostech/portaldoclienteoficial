import { useState, useEffect, useCallback, useRef } from "react";
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
  const redirectInProgress = useRef(false);

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
      
      // Always redirect to main login
      navigate("/");
      
      toast.success("Desconectado com sucesso!");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(`Erro ao desconectar: ${error.message}`);
    }
  };

  // Safe navigation function to prevent multiple redirects
  const safeNavigate = useCallback((path: string) => {
    if (redirectInProgress.current) return;
    
    redirectInProgress.current = true;
    console.log(`Redirecting to: ${path}`);
    navigate(path);
    
    // Reset the flag after a delay to allow navigation to complete
    setTimeout(() => {
      redirectInProgress.current = false;
    }, 100);
  }, [navigate]);

  // Initialize auth state
  useEffect(() => {
    console.log("AuthProvider: Initializing");
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        
        if (!mounted) return;
        
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          
          // Check user role and handle redirection
          const isUserAdmin = await checkUserRole(newSession.user.id);
          console.log("User is admin:", isUserAdmin);
          setIsAdmin(isUserAdmin);
          
          // Handle redirection after successful sign-in
          if (event === 'SIGNED_IN') {
            const currentPath = window.location.pathname;
            
            // If on login page, redirect to appropriate dashboard
            if (currentPath === '/') {
              if (isUserAdmin) {
                safeNavigate("/admin");
              } else {
                safeNavigate("/dashboard");
              }
            }
          }
          
          setLoading(false);
        } else {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // Check for existing session
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
          console.log("User is admin (from existing session):", isUserAdmin);
          setIsAdmin(isUserAdmin);
          
          const currentPath = window.location.pathname;
          
          // Redirect based on user role and current path
          if (currentPath === '/') {
            // On login page with valid session, redirect to appropriate dashboard
            if (isUserAdmin) {
              safeNavigate('/admin');
            } else {
              safeNavigate('/dashboard');
            }
          } else if (isAdminPath(currentPath) && !isUserAdmin) {
            // Non-admin trying to access admin area
            toast.error("Apenas administradores podem acessar este portal.");
            safeNavigate('/');
          } else if (isClientPath(currentPath) && isUserAdmin) {
            // Admin trying to access client area
            toast.error("Administradores devem acessar pelo portal administrativo.");
            safeNavigate('/admin');
          }
        } else {
          // No session, redirect protected paths to login
          const currentPath = window.location.pathname;
          
          if (isAdminPath(currentPath) || isClientPath(currentPath)) {
            safeNavigate('/');
          }
        }
        
        setLoading(false);
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
  }, [checkUserRole, safeNavigate]);

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
