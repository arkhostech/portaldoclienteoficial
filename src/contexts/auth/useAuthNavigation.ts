
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

    // Admin trying to access client areas - redirect to admin dashboard
    if (isUserAdmin && isClientPath(currentPath) && currentPath !== '/') {
      console.log("Admin user trying to access client section, redirecting to admin dashboard");
      navigate('/admin');
      return;
    }
    
    // Client trying to access admin areas - redirect to client dashboard
    if (!isUserAdmin && isAdminPath(currentPath) && currentPath !== '/admin-login') {
      console.log("Client user trying to access admin section, redirecting to client dashboard");
      toast.error("Apenas administradores podem acessar este portal.");
      navigate('/dashboard');
      return;
    }
    
    // Admin is already on admin path or client on client path - no redirect needed
    if ((isUserAdmin && isAdminPath(currentPath)) || 
        (!isUserAdmin && isClientPath(currentPath))) {
      return;
    }
    
    // Handle login page redirects
    if (currentPath === '/admin-login') {
      if (isUserAdmin) {
        navigate('/admin');
      }
    } else if (currentPath === '/') {
      if (!isUserAdmin && hasSession) {
        navigate('/dashboard');
      } else if (isUserAdmin) {
        navigate('/admin');
      }
    }
  };

  return {
    handleAuthRedirect,
    handleSessionRedirect
  };
}
