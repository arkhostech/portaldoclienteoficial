import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/auth';
import { Skeleton } from '@/components/ui/skeleton';


interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  const location = useLocation();
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  const isAdminPath = (path: string): boolean => {
    return path === '/admin-login' || path.startsWith('/admin');
  };

  const isClientPath = (path: string): boolean => {
    return path === '/' || path === '/dashboard' || 
           path === '/documents' || path === '/payments' || 
           path === '/knowledge' || path === '/messages';
  };
  

  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!loading && !redirectAttempted) {
      if (!user) {
        console.log("No authenticated user detected, redirecting to login");
        if (isAdminPath(location.pathname)) {
          setRedirectAttempted(true);
          navigate('/admin-login');
        } else {
          setRedirectAttempted(true);
          navigate('/');
        }
        return;
      }
      
      const currentPath = location.pathname;
      
      if (isAdmin && isClientPath(currentPath) && currentPath !== '/' && !redirectAttempted) {
        console.log("Admin trying to access client section, redirecting to admin dashboard");
        setRedirectAttempted(true);
        navigate('/admin');
        return;
      }
      
      if (!isAdmin && isAdminPath(currentPath) && currentPath !== '/admin-login' && !redirectAttempted) {
        console.log("Client trying to access admin section, redirecting to client dashboard");
        setRedirectAttempted(true);
        navigate('/dashboard');
        return;
      }
    }
  }, [user, loading, navigate, isAdmin, location.pathname, redirectAttempted]);

  // Reset the redirect flag when location changes
  useEffect(() => {
    setRedirectAttempted(false);
  }, [location.pathname]);

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

  if (!user) {
    console.log("MainLayout: User not authenticated, returning null");
    return null;
  }

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  console.log("MainLayout: Rendering main layout");
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen} 
        onCollapseChange={handleSidebarCollapse}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <Header 
          title={title} 
          toggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>

    </div>
  );
}

export default MainLayout;
