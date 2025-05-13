
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useLocation } from "react-router-dom";
import { useUserRole } from "./useUserRole";
import { useAuthNavigation } from "./useAuthNavigation";

export function useRoleVerification(
  user: User | null, 
  loading: boolean, 
  setLoading: (value: boolean) => void
) {
  const [roleVerified, setRoleVerified] = useState(false);
  const location = useLocation();
  const { updateUserRole } = useUserRole();
  const { handleAuthRedirect, handleSessionRedirect } = useAuthNavigation();

  // Verify user role when user or path changes
  useEffect(() => {
    let mounted = true;
    
    const verifyUserRole = async () => {
      if (!user || roleVerified) return;
      
      console.log("Verifying user role for:", user.id);
      try {
        const isUserAdmin = await updateUserRole(user);
        
        if (!mounted) return;
        
        handleSessionRedirect(isUserAdmin, window.location.pathname, true);
        setLoading(false);
        setRoleVerified(true);
      } catch (error) {
        console.error("Error in role verification:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (user && !roleVerified) {
      verifyUserRole();
    } else if (!user && !loading) {
      handleSessionRedirect(false, window.location.pathname, false);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [user, location.pathname, roleVerified]);

  return { roleVerified };
}
