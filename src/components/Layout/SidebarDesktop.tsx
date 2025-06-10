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
        className={`hidden md:flex h-screen flex-col fixed left-0 top-0 z-20 transition-all duration-300 ${sidebarWidth}`}
        style={{ backgroundColor: '#14140F' }}
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
            className="text-white hover:text-white"
            style={{ 
              backgroundColor: 'transparent',
              '--hover-bg': 'rgba(163, 204, 171, 0.15)'
            } as any}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(163, 204, 171, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
        
        {/* Divider */}
        <div className="mx-4 h-px" style={{ backgroundColor: 'rgba(163, 204, 171, 0.2)' }}></div>
        
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
                          className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 rounded-lg transition-colors relative`}
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
                        >
                          {item.icon}
                          {!isCollapsed && <span className="text-sm font-medium ml-3">{item.title}</span>}
                          <NotificationBadge 
                            show={!!item.hasNotification} 
                            className={`${isCollapsed ? 'top-1 right-1' : 'top-2.5 right-3'}`}
                            size="md"
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
          
          {/* Divider */}
          <div className="mx-4 h-px mb-4" style={{ backgroundColor: 'rgba(163, 204, 171, 0.2)' }}></div>
          
          <div className="p-4">
            <div 
              className="p-3 rounded-lg mb-4"
              style={{ backgroundColor: 'rgba(5, 61, 56, 0.5)' }}
            >
              {!isCollapsed && (
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
              )}
            </div>
            
            <Button 
              className={`w-full text-white border-transparent ${
                isCollapsed ? 'px-2' : ''
              }`}
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
