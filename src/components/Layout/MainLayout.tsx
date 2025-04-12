
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  const location = useLocation();
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Determine if the current path is in the admin section
  const isAdminPath = (path: string): boolean => {
    return path === '/admin-login' || path.startsWith('/admin');
  };

  // Determine if the current path is in the client section
  const isClientPath = (path: string): boolean => {
    return path === '/' || path === '/dashboard' || 
           path === '/documents' || path === '/payments' || 
           path === '/knowledge';
  };
  
  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
    
    console.log("MainLayout useEffect: loading=", loading, "user=", !!user);
    
    // Only redirect if not loading and no user
    if (!loading && !user) {
      console.log("No authenticated user detected, redirecting to login");
      // Redirect to the appropriate login page based on the current path
      if (isAdminPath(location.pathname)) {
        navigate('/admin-login');
      } else {
        navigate('/');
      }
      return;
    }
    
    // Only check path validity, don't force redirects on refresh
    // This prevents users from being logged out on page refresh
    if (!loading && user) {
      const currentPath = location.pathname;
      
      // Only redirect if user is clearly in the wrong section
      // This allows refreshing pages within the proper section
      if (isAdmin && currentPath === '/') {
        console.log("Admin trying to access client login, redirecting to admin dashboard");
        navigate('/admin');
        return;
      }
      
      if (!isAdmin && currentPath === '/admin-login') {
        console.log("Client trying to access admin login, redirecting to client dashboard");
        navigate('/dashboard');
        return;
      }
    }
  }, [location.pathname, user, loading, navigate, isAdmin]);

  // Show loading state with skeletons
  if (loading) {
    console.log("MainLayout: Showing loading skeleton");
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="w-full max-w-md space-y-4 p-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-48 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="flex justify-center">
            <div className="h-12 w-12 border-4 border-t-[#eac066] border-gray-200 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-center text-[#111111]">Carregando...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    console.log("MainLayout: User not authenticated, returning null");
    return null;
  }

  console.log("MainLayout: Rendering main layout");
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
