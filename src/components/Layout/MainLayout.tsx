
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
    
    // Check if user is authenticated
    if (!loading && !user) {
      navigate('/');
    }
  }, [location.pathname, user, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-t-[#eac066] border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#111111]">Carregando...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

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
