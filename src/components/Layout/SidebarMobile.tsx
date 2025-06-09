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
      <div className="fixed left-0 top-0 w-64 h-screen bg-secondary z-50 flex flex-col sm:hidden">
        <div className="flex justify-between items-center p-4 h-16 border-b border-white/10">
          <h1 className="text-white text-lg font-bold">
            {isAdmin ? "Admin Portal" : "Portal do Cliente"}
          </h1>
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
              {navItems.map((item) => (
                <li key={item.title}>
                  <Link 
                    to={item.href} 
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors relative
                      ${currentPath === item.href 
                        ? 'bg-accent text-secondary font-medium' 
                        : 'text-white hover:bg-white/10'
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span className="text-sm font-medium ml-3">{item.title}</span>
                    <NotificationBadge 
                      show={!!item.hasNotification} 
                      className="top-2 right-2"
                      size="sm"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4">
            <Button 
              variant="outline" 
              className="w-full bg-transparent border-white text-white hover:bg-accent hover:text-secondary hover:border-accent"
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
