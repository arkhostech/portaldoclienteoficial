
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { isAdminPath, isClientPath } from "./utils";

export function useAuthNavigation() {
  const navigate = useNavigate();

  const handleAuthRedirect = (
    isUserAdmin: boolean, 
    currentPath: string, 
    event?: string
  ) => {
    // Only handle redirection for new sign-ins, not for refreshed sessions
    if (event === 'SIGNED_IN') {
      if (currentPath === '/admin-login') {
        if (!isUserAdmin) {
          toast.error("Apenas administradores podem acessar este portal.");
          navigate('/');
        } else {
          navigate("/admin");
        }
      } else if (currentPath === '/') {
        if (isUserAdmin) {
          toast.error("Administradores devem acessar pelo portal administrativo.");
          navigate('/admin-login');
        } else {
          navigate("/dashboard");
        }
      }
    }
  };

  const handleSessionRedirect = (
    isUserAdmin: boolean,
    currentPath: string,
    hasSession: boolean
  ) => {
    console.log("Session redirect check:", { 
      isUserAdmin, 
      currentPath, 
      hasSession,
      isAdminPath: isAdminPath(currentPath),
      isClientPath: isClientPath(currentPath)
    });
    
    if (!hasSession) {
      // Handle not logged in - redirect to appropriate login page if trying to access protected path
      if (isAdminPath(currentPath) && currentPath !== '/admin-login') {
        navigate('/admin-login');
      } else if (isClientPath(currentPath) && currentPath !== '/') {
        navigate('/');
      }
      return;
    }

    // If user is authenticated as admin, ensure they have access to admin paths
    if (isUserAdmin && isAdminPath(currentPath)) {
      // Admin is already on an admin path, no need to redirect
      console.log("Admin user on admin path, no redirect needed");
      return;
    }
    
    // If user is authenticated as client, ensure they have access to client paths
    if (!isUserAdmin && isClientPath(currentPath)) {
      // Client is already on a client path, no redirect needed
      console.log("Client user on client path, no redirect needed");
      return;
    }

    // Handle incorrect path access
    if (isAdminPath(currentPath) && !isUserAdmin && currentPath !== '/admin-login') {
      toast.error("Apenas administradores podem acessar este portal.");
      navigate('/');
    } else if (isClientPath(currentPath) && isUserAdmin && currentPath !== '/') {
      toast.error("Administradores devem acessar pelo portal administrativo.");
      navigate('/admin-login');
    }
  };

  return {
    handleAuthRedirect,
    handleSessionRedirect
  };
}
