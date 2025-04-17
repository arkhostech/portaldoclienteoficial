
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { NavItem } from '@/hooks/useSidebarNavigation';
import { LogOut, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const sidebarWidth = isCollapsed ? 'w-16' : 'w-56';
  
  return (
    <>
      {/* Desktop sidebar */}
      <div className={`hidden lg:flex h-screen bg-secondary flex-col fixed left-0 top-0 ${sidebarWidth} transition-all duration-300 z-20`}>
        <div className="flex justify-between items-center p-4">
          {!isCollapsed && (
            <h1 className="text-white text-xl font-bold truncate">
              {isAdmin ? 'Admin Portal' : 'Portal Cliente'}
            </h1>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-accent hover:text-secondary ml-auto"
            onClick={toggleCollapse}
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
                          className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 rounded-lg transition-colors
                            ${currentPath === item.href 
                              ? 'bg-accent text-secondary font-medium' 
                              : 'text-white hover:bg-white/10'
                            }`}
                        >
                          {item.icon}
                          {!isCollapsed && <span className="text-sm font-medium ml-3">{item.title}</span>}
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`${isCollapsed ? 'p-2 w-8 aspect-square mx-auto justify-center' : 'w-full'} bg-transparent border-white text-white hover:bg-accent hover:text-secondary hover:border-accent`}
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span className="ml-2">Sair</span>}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>Sair</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Mini sidebar for tablet view */}
      <div className="hidden sm:flex lg:hidden h-screen bg-secondary flex-col fixed left-0 top-0 w-16 z-20">
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
            <TooltipProvider>
              <ul className="space-y-4 flex flex-col items-center">
                {navItems.map((item) => (
                  <li key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </TooltipProvider>
          </nav>
          
          <div className="mt-auto mb-4 flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleSignOut}
                    className="text-white hover:bg-white/10 w-12 h-12"
                    title="Sair"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Sair</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarDesktop;
