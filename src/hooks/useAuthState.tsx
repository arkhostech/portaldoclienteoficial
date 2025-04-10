
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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

      return data?.role === 'admin' || false;
    } catch (err) {
      console.error("Error checking admin status:", err);
      return false;
    }
  };

  useEffect(() => {
    console.log("useAuthState: Initializing auth state");
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        
        if (!mounted) return;
        
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          
          // Check if user is admin
          if (newSession.user) {
            const adminStatus = await checkIsAdmin(newSession.user.id);
            if (mounted) setIsAdmin(adminStatus);
          }
        } else {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
        
        // Always make sure loading state is updated after auth changes
        if (mounted) setLoading(false);
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
          
          const adminStatus = await checkIsAdmin(session.user.id);
          if (mounted) setIsAdmin(adminStatus);
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        if (mounted) {
          console.log("Setting loading to false after session check");
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      console.log("useAuthState: Cleaning up");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading, isAdmin };
}
