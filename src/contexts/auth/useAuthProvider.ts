
import { useLocation } from "react-router-dom";
import { useAuthState } from "./useAuthState";
import { AuthContextType } from "./types";

export function useAuthProvider(): AuthContextType {
  const location = useLocation();
  const authState = useAuthState();
  
  console.log("Auth state:", { 
    user: !!authState.user, 
    loading: authState.loading, 
    isAdmin: authState.isAdmin, 
    path: location.pathname 
  });
  
  return authState;
}
