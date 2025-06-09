import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { NavItem } from '@/hooks/useSidebarNavigation';
import { LogOut, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NotificationBadge } from '@/components/ui/notification-badge';

interface SidebarDesktopProps {
  navItems: NavItem[];
  currentPath: string;
  isAdmin: boolean;
  handleSignOut: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const SidebarDesktop = ({ 
  navItems, 
  currentPath,
  isAdmin,
  handleSignOut,
  isCollapsed,
  toggleCollapse
}: SidebarDesktopProps) => {
  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';
  
  return (
    <>
      {/* Sidebar principal (md e acima) */}
      <div 
        className={`hidden md:flex h-screen bg-secondary flex-col fixed left-0 top-0 z-20 transition-all duration-300 ${sidebarWidth}`}
      >
        <div className="flex justify-between items-center p-4 h-16">
          {!isCollapsed && (
            <h1 className="text-lg font-bold text-white">
              {isAdmin ? "Admin Portal" : "Portal do Cliente"}
            </h1>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleCollapse}
            className="text-white hover:bg-accent hover:text-secondary"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <nav className="mt-4 px-2">
            <TooltipProvider delayDuration={300}>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link 
                          to={item.href} 
                          className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 rounded-lg transition-colors relative
                            ${currentPath === item.href 
                              ? 'bg-[#1e3a8a] text-white font-medium' 
                              : 'text-white hover:bg-white/10'
                            }`}
                        >
                          {item.icon}
                          {!isCollapsed && <span className="text-sm font-medium ml-3">{item.title}</span>}
                          <NotificationBadge 
                            show={!!item.hasNotification} 
                            className={`${isCollapsed ? 'top-1 right-1' : 'top-2 right-2'}`}
                            size="sm"
                          />
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </TooltipProvider>
          </nav>
          
          <div className="p-4">
            <Button 
              variant="outline" 
              className={`w-full bg-transparent border-white text-white hover:bg-accent hover:text-secondary hover:border-accent ${
                isCollapsed ? 'px-2' : ''
              }`}
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-2">Sair</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarDesktop;
