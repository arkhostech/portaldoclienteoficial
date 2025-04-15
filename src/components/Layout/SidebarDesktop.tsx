
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { NavItem } from '@/hooks/useSidebarNavigation';
import { LogOut, Menu } from 'lucide-react';

interface SidebarDesktopProps {
  navItems: NavItem[];
  currentPath: string;
  isAdmin: boolean;
  handleSignOut: () => void;
}

const SidebarDesktop = ({ 
  navItems, 
  currentPath,
  isAdmin,
  handleSignOut 
}: SidebarDesktopProps) => {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen bg-secondary flex-col fixed left-0 top-0 w-64">
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
              {navItems.map((item) => (
                <li key={item.title}>
                  <Link 
                    to={item.href} 
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors
                      ${currentPath === item.href 
                        ? 'bg-accent text-secondary font-medium' 
                        : 'text-white hover:bg-white/10'
                      }`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium ml-3">{item.title}</span>
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

      {/* Mini sidebar for tablet view */}
      <div className="hidden sm:flex lg:hidden h-screen bg-secondary flex-col fixed left-0 top-0 w-20 z-20">
        <div className="flex justify-center items-center p-4 h-16">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-accent hover:text-secondary"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col">
          <nav className="mt-4">
            <ul className="space-y-4 flex flex-col items-center">
              {navItems.map((item) => (
                <li key={item.title}>
                  <Link 
                    to={item.href} 
                    className={`flex items-center justify-center p-3 rounded-lg transition-colors w-12 h-12
                      ${currentPath === item.href 
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
              onClick={handleSignOut}
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

export default SidebarDesktop;
