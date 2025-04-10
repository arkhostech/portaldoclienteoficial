
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
  
  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
    
    console.log("MainLayout useEffect: loading=", loading, "user=", !!user);
    
    // Only redirect if not loading and no user
    if (!loading && !user) {
      console.log("No authenticated user detected, redirecting to login");
      navigate('/');
      return;
    }
    
    // Redirect admin users to admin dashboard and regular users to client dashboard
    if (!loading && user) {
      const currentPath = location.pathname;
      
      // If admin is trying to access client pages
      if (isAdmin && currentPath.startsWith('/dashboard')) {
        navigate('/admin');
        return;
      }
      
      // If client is trying to access admin pages
      if (!isAdmin && currentPath.startsWith('/admin')) {
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
};

export default MainLayout;
