
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { useUserRole } from "./useUserRole";
import { useAuthActions } from "./useAuthActions";
import { useAuthNavigation } from "./useAuthNavigation";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  const location = useLocation();
  const { isAdmin, updateUserRole } = useUserRole();
  const { signIn, signOut } = useAuthActions();
  const { handleAuthRedirect, handleSessionRedirect } = useAuthNavigation();

  useEffect(() => {
    console.log("AuthProvider: Initializing");
    let mounted = true;
    let userChecked = false;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        
        if (!mounted) return;
        
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          
          // Use immediate state update to prevent loop
          if (newSession.user && !userChecked) {
            userChecked = true;
            try {
              const isUserAdmin = await updateUserRole(newSession.user);
              
              if (mounted) {
                setLoading(false);
                handleAuthRedirect(isUserAdmin, window.location.pathname, event);
              }
            } catch (error) {
              console.error("Error in admin check:", error);
              if (mounted) {
                setLoading(false);
              }
            }
          } else {
            setLoading(false);
          }
        } else {
          setSession(null);
          setUser(null);
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
            userChecked = true;
            
            try {
              const isUserAdmin = await updateUserRole(session.user);
              
              if (mounted) {
                setLoading(false);
                handleSessionRedirect(isUserAdmin, window.location.pathname, true);
              }
            } catch (error) {
              console.error("Error in admin check:", error);
              if (mounted) {
                setLoading(false);
              }
            }
          } else {
            handleSessionRedirect(false, window.location.pathname, false);
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
  }, [location.pathname, sessionChecked]);

  return {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signOut: () => signOut(user?.id)
  };
}
