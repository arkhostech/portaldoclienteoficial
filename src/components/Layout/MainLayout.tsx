
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { FloatingChatButton } from '@/components/chat/FloatingChatButton';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  const location = useLocation();
  const { user, loading, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const renderCountRef = useRef(0);
  
  // Use the auth navigation hook
  useAuthNavigation();
  
  // Log render count to help debug infinite loops
  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`MainLayout render #${renderCountRef.current} - path: ${location.pathname}`);
  });
  
  // Only show floating chat button on client pages (not admin) and not on the messages page itself
  const shouldShowFloatingButton = !isAdmin && !location.pathname.includes('/messages');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Reset the redirect flag when location changes
  useEffect(() => {
    setRedirectAttempted(false);
  }, [location.pathname]);

  if (loading) {
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
    return null;
  }

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen} 
        onCollapseChange={handleSidebarCollapse}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'sm:ml-16 lg:ml-16' : 'sm:ml-16 lg:ml-56'}`}>
        <Header 
          title={title} 
          toggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
      {shouldShowFloatingButton && <FloatingChatButton />}
    </div>
  );
}

export default MainLayout;
