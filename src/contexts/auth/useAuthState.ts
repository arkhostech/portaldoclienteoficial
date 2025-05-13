
import { useLocation } from "react-router-dom";
import { useUserRole } from "./useUserRole";
import { useAuthActions } from "./useAuthActions";
import { useSessionInit } from "./useSessionInit";
import { useRoleVerification } from "./useRoleVerification";

export function useAuthState() {
  const location = useLocation();
  const { isAdmin } = useUserRole();
  const { signIn, signOut } = useAuthActions();
  
  // Initialize session state
  const { 
    user, 
    session, 
    loading, 
    setLoading, 
    sessionChecked 
  } = useSessionInit();
  
  // Verify user role and handle redirects
  useRoleVerification(user, loading, setLoading);

  return {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signOut: () => signOut(user?.id)
  };
}
