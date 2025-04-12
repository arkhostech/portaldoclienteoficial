
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { 
  LayoutDashboard, 
  FolderOpen, 
  CreditCard,
  BookOpen,
  Menu,
  LogOut,
  Users,
  Settings,
  BarChart,
  FileText,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const { isAdmin, signOut } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if screen is mobile on mount and when window is resized
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Define menu items based on user role
  const navItems = isAdmin 
    ? [
        { 
          title: 'Dashboard', 
          icon: <LayoutDashboard className="h-5 w-5" />, 
          href: '/admin' 
        },
        { 
          title: 'Clientes', 
          icon: <Users className="h-5 w-5" />, 
          href: '/admin/clients' 
        },
        { 
          title: 'Documentos', 
          icon: <FileText className="h-5 w-5" />, 
          href: '/admin/documents' 
        },
        { 
          title: 'Processos', 
          icon: <FileText className="h-5 w-5" />, 
          href: '/admin/cases' 
        },
        { 
          title: 'Pagamentos', 
          icon: <CreditCard className="h-5 w-5" />, 
          href: '/admin/payments' 
        },
        { 
          title: 'Relatórios', 
          icon: <BarChart className="h-5 w-5" />, 
          href: '/admin/reports' 
        },
        { 
          title: 'Configurações', 
          icon: <Settings className="h-5 w-5" />, 
          href: '/admin/settings' 
        }
      ]
    : [
        { 
          title: 'Dashboard', 
          icon: <LayoutDashboard className="h-5 w-5" />, 
          href: '/dashboard' 
        },
        { 
          title: 'Documentos', 
          icon: <FolderOpen className="h-5 w-5" />, 
          href: '/documents' 
        },
        { 
          title: 'Pagamentos', 
          icon: <CreditCard className="h-5 w-5" />, 
          href: '/payments' 
        },
        { 
          title: 'Base de Conhecimento', 
          icon: <BookOpen className="h-5 w-5" />, 
          href: '/knowledge' 
        }
      ];

  // Close sidebar when clicking a link on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Mobile sidebar overlay
  const mobileOverlay = (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
      onClick={() => setIsOpen(false)}
    />
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOverlay}

      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-secondary z-20 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4">
          <h1 className="text-white text-xl font-bold">{isAdmin ? 'Admin Portal' : 'Portal Cliente'}</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-accent hover:text-secondary"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col justify-between h-[calc(100%-64px)]">
          <nav className="mt-4 px-2">
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.href} 
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors
                      ${location.pathname === item.href 
                        ? 'bg-accent text-secondary font-medium' 
                        : 'text-white hover:bg-white/10'
                      }`}
                    onClick={handleNavClick}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4">
            <Button 
              variant="outline" 
              className="w-full bg-transparent border-white text-white hover:bg-accent hover:text-secondary hover:border-accent"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex h-screen bg-secondary flex-col fixed left-0 top-0 transition-all duration-300 z-20 w-64`}>
        <div className="flex justify-between items-center p-4">
          <h1 className="text-white text-xl font-bold">{isAdmin ? 'Admin Portal' : 'Portal Cliente'}</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-accent hover:text-secondary"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <nav className="mt-4 px-2">
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.href} 
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors
                      ${location.pathname === item.href 
                        ? 'bg-accent text-secondary font-medium' 
                        : 'text-white hover:bg-white/10'
                      }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4">
            <Button 
              variant="outline" 
              className="w-full bg-transparent border-white text-white hover:bg-accent hover:text-secondary hover:border-accent"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mini sidebar for tablet view */}
      <div className="hidden sm:flex lg:hidden h-screen bg-secondary flex-col fixed left-0 top-0 w-20 z-20">
        <div className="flex justify-center items-center p-4 h-16">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(true)}
            className="text-white hover:bg-accent hover:text-secondary"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col">
          <nav className="mt-4">
            <ul className="space-y-4 flex flex-col items-center">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.href} 
                    className={`flex items-center justify-center p-3 rounded-lg transition-colors w-12 h-12
                      ${location.pathname === item.href 
                        ? 'bg-accent text-secondary' 
                        : 'text-white hover:bg-white/10'
                      }`}
                    title={item.title}
                  >
                    {item.icon}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="mt-auto mb-4 flex justify-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={signOut}
              className="text-white hover:bg-white/10 w-12 h-12"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
