
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
    if (!hasSession) {
      // Handle not logged in - redirect to appropriate login page if trying to access protected path
      if (isAdminPath(currentPath) && currentPath !== '/admin-login') {
        navigate('/admin-login');
      } else if (isClientPath(currentPath) && currentPath !== '/') {
        navigate('/');
      }
      return;
    }

    // Only redirect in specific cases to avoid loops
    if (currentPath === '/admin-login') {
      if (isUserAdmin) {
        navigate('/admin');
      }
      // If not admin, let them see the login page
    } else if (currentPath === '/') {
      if (!isUserAdmin && hasSession) {
        navigate('/dashboard');
      }
      // If admin, let them see the client login page
    } else if (isAdminPath(currentPath) && !isUserAdmin) {
      // Only redirect if not on admin login page
      if (currentPath !== '/admin-login') {
        toast.error("Apenas administradores podem acessar este portal.");
        navigate('/');
      }
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
