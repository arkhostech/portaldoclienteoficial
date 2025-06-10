import { X, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { NavItem } from '@/hooks/useSidebarNavigation';
import { NotificationBadge } from '@/components/ui/notification-badge';

interface SidebarMobileProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  navItems: NavItem[];
  currentPath: string;
  isAdmin: boolean;
  handleSignOut: () => void;
}

const SidebarMobile = ({ 
  isOpen, 
  setIsOpen, 
  navItems, 
  currentPath, 
  isAdmin, 
  handleSignOut 
}: SidebarMobileProps) => {
  
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Mobile Sidebar */}
      <div 
        className="fixed left-0 top-0 w-64 h-screen z-50 flex flex-col sm:hidden"
        style={{ backgroundColor: '#14140F' }}
      >
        <div className="flex justify-between items-center p-4 h-16" style={{ borderBottom: '1px solid rgba(163, 204, 171, 0.2)' }}>
          <h1 className="text-white text-lg font-bold">
            {isAdmin ? "Admin Portal" : "Portal do Cliente"}
          </h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-white"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(163, 204, 171, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col justify-between h-[calc(100%-64px)]">
          <nav className="mt-4 px-2">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.title}>
                  <Link 
                    to={item.href} 
                    className="flex items-center px-4 py-3 rounded-lg transition-colors relative"
                    style={{
                      backgroundColor: currentPath === item.href ? '#053D38' : 'transparent',
                      color: currentPath === item.href ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPath !== item.href) {
                        e.currentTarget.style.backgroundColor = 'rgba(163, 204, 171, 0.15)';
                        e.currentTarget.style.color = '#A3CCAB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPath !== item.href) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                      }
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span className="text-sm font-medium ml-3">{item.title}</span>
                    <NotificationBadge 
                      show={!!item.hasNotification} 
                      className="top-2.5 right-3"
                      size="md"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Divider */}
          <div className="mx-4 h-px mb-4" style={{ backgroundColor: 'rgba(163, 204, 171, 0.2)' }}></div>
          
          <div className="p-4">
            <div 
              className="p-3 rounded-lg mb-4"
              style={{ backgroundColor: 'rgba(5, 61, 56, 0.5)' }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{ backgroundColor: '#A3CCAB', color: '#14140F' }}
                >
                  {isAdmin ? 'A' : 'U'}
                </div>
                <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  <div className="font-medium text-white">
                    {isAdmin ? 'Administrador' : 'Cliente'}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Conectado
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full text-white border-transparent"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F26800';
                e.currentTarget.style.borderColor = '#F26800';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMobile;
