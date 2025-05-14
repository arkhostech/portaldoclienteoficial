
import { useState, useEffect, useCallback, useRef } from "react";
import { AuthSession, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkUserRoleWithCache, clearUserRoleCache } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null | false>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const redirectInProgressRef = useRef(false);
  
  // Safe navigate function to prevent navigation loops
  const safeNavigate = (path: string) => {
    if (redirectInProgressRef.current) return;
    redirectInProgressRef.current = true;
    navigate(path);
    
    setTimeout(() => {
      redirectInProgressRef.current = false;
    }, 100);
  };

  // Initialize auth state
  const initAuth = useCallback(async () => {
    console.info("AuthProvider: Initializing");
    try {
      console.info("Checking existing session");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await handleAuthChange(session);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle auth changes
  const handleAuthChange = useCallback(async (session: AuthSession | null) => {
    if (!session) {
      setUser(null);
      setIsAdmin(false);
      return;
    }
    
    try {
      const currentUser = session.user;
      setUser(currentUser);
      
      if (currentUser) {
        const userRole = await checkUserRoleWithCache(currentUser.id);
        const isUserAdmin = userRole === 'admin';
        setIsAdmin(isUserAdmin);
        console.log("User role:", userRole, "isAdmin:", isUserAdmin);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setIsAdmin(false);
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const userRole = await checkUserRoleWithCache(data.user.id);
        const isUserAdmin = userRole === 'admin';
        
        // Navigate to appropriate dashboard based on role
        if (isUserAdmin) {
          safeNavigate('/admin');
        } else {
          safeNavigate('/dashboard');
        }
        
        return { success: true };
      }
      
      return { success: false, error: "No user data returned" };
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Erro ao fazer login");
      return { success: false, error: error.message };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      clearUserRoleCache(user?.id || '');
      safeNavigate('/');
      return { success: true };
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(error.message || "Erro ao sair");
      return { success: false, error: error.message };
    }
  }, [user]);

  // Subscribe to auth changes
  useEffect(() => {
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.info("Auth state changed:", event, {
          _type: typeof session,
          value: typeof session === 'undefined' ? 'undefined' : session ? 'session' : 'null'
        });
        handleAuthChange(session);
      }
    );

    return () => {
      console.info("AuthProvider: Cleaning up");
      subscription.unsubscribe();
    };
  }, [initAuth, handleAuthChange]);

  // Debug auth state
  useEffect(() => {
    console.info("Auth state:", { user, loading, isAdmin, path: window.location.pathname });
  }, [user, loading, isAdmin]);

  return {
    user,
    loading,
    isAdmin,
    signIn,
    signOut,
  };
};
