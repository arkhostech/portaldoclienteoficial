
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSessionInit() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Sets up auth state listener and checks for existing session
  useEffect(() => {
    console.log("Auth: Initializing session");
    let mounted = true;
    let userChecked = false;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        
        if (!mounted) return;
        
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
        } else {
          setSession(null);
          setUser(null);
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
          }
        } catch (error) {
          console.error("Error getting session:", error);
        }
        setSessionChecked(true);
      };

      checkSession();
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [sessionChecked]);

  return {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    sessionChecked,
    setSessionChecked
  };
}
