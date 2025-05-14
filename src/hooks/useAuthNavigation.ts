
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

export const useAuthNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading } = useAuth();
  const redirectInProgressRef = useRef(false);
  
  // Helper function to safely navigate without causing loops
  const safeNavigate = (path: string) => {
    if (location.pathname === path || redirectInProgressRef.current) {
      return;
    }
    
    redirectInProgressRef.current = true;
    navigate(path);
    
    // Reset after a small delay to allow the navigation to complete
    setTimeout(() => {
      redirectInProgressRef.current = false;
    }, 100);
  };
  
  useEffect(() => {
    if (loading) return;
    
    // Check if the user is on an admin page
    const isAdminPath = location.pathname.startsWith('/admin') && 
                         location.pathname !== '/admin-login';
    
    // Check if the user is on a client page
    const isClientPath = ['/dashboard', '/documents', '/messages', '/payments'].includes(location.pathname);
    
    if (!user) {
      if (isAdminPath) {
        console.log("Not authenticated, redirecting from admin path to admin login");
        safeNavigate('/admin-login');
      } else if (isClientPath) {
        console.log("Not authenticated, redirecting from client path to home");
        safeNavigate('/');
      }
    } else {
      // User is authenticated
      if (isAdmin) {
        if (isClientPath) {
          console.log("Admin user trying to access client path, redirecting to admin");
          safeNavigate('/admin');
        }
      } else {
        // Regular client user
        if (isAdminPath) {
          console.log("Client user trying to access admin path, redirecting to dashboard");
          safeNavigate('/dashboard');
        }
      }
    }
  }, [user, isAdmin, loading, location.pathname]);
  
  return { safeNavigate };
};
