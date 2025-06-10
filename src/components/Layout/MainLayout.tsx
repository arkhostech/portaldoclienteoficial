import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Menu } from 'lucide-react';


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
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Controlar quando parar de mostrar o skeleton
  useEffect(() => {
    if (!loading && user !== null) {
      // Dar um pequeno delay para garantir que tudo está carregado
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 300); // 300ms de delay para suavizar a transição
      
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(true);
    }
  }, [loading, user, isAdmin]);

  // Mostrar skeleton durante loading ou enquanto determinamos o papel do usuário
  if (loading || showSkeleton) {
    console.log("MainLayout: Showing enhanced loading skeleton");
    return (
      <div className="flex min-h-screen bg-white">
        {/* Skeleton do Sidebar */}
        <div className="hidden md:block w-64 bg-gray-50 border-r border-gray-200">
          <div className="p-6 space-y-6">
            {/* Logo skeleton */}
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            
            {/* Navigation items skeleton */}
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="flex items-center space-x-3 p-3 rounded-lg">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
            
            {/* User section skeleton */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton do conteúdo principal */}
        <div className="flex-1 flex flex-col">
          {/* Mobile menu button skeleton */}
          <div className="md:hidden p-4">
            <Skeleton className="h-10 w-10 rounded-lg ml-auto" />
          </div>
          
          {/* Main content skeleton */}
          <main className="flex-1 p-4 md:p-6 space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            
            {/* Cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((card) => (
                <div key={card} className="p-6 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-5 w-5" />
                  </div>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            
            {/* Table/List skeleton */}
            <div className="bg-white rounded-lg border p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((row) => (
                  <div key={row} className="flex items-center space-x-4 py-3 border-b border-gray-100">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>

        {/* Loading indicator */}
        <div className="fixed bottom-6 right-6 bg-white rounded-full p-3 shadow-lg border">
          <div className="h-6 w-6 border-2 border-t-[#053D38] border-gray-200 rounded-full animate-spin"></div>
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
        {/* Mobile menu button */}
        <button 
          className="fixed top-4 right-4 z-30 sm:hidden bg-white border border-gray-200 rounded-lg p-2 shadow-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>

    </div>
  );
}

export default MainLayout;
