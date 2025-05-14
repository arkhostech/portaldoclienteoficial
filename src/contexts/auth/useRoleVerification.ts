
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
        
        console.log("Role verification complete. Is admin:", isUserAdmin);
        console.log("Current path during role verification:", window.location.pathname);
        
        // Added delay to ensure role is properly set before redirection
        setTimeout(() => {
          if (mounted) {
            handleSessionRedirect(isUserAdmin, window.location.pathname, true);
            setLoading(false);
            setRoleVerified(true);
          }
        }, 0);
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
