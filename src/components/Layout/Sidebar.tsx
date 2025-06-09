import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/auth";
import { useNotifications } from "@/contexts/notifications";
import { useClientNotifications } from "@/contexts/clientNotifications";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings,
  FolderOpen,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useSidebarNavigation } from '@/hooks/useSidebarNavigation';
import SidebarMobile from './SidebarMobile';
import SidebarDesktop from './SidebarDesktop';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen, onCollapseChange }: SidebarProps) => {
  const { isAdmin, signOut } = useAuth();
  
  // 🎯 SISTEMA CORRETO: Admin usa NotificationsProvider, Cliente usa ClientNotificationsProvider
  const adminNotifications = useNotifications();
  const clientNotifications = useClientNotifications();
  
  // Selecionar o sistema correto baseado no tipo de usuário
  const hasUnreadMessages = isAdmin ? adminNotifications.hasUnreadMessages : clientNotifications.hasUnreadMessages;
  
  const { navItems, currentPath } = useSidebarNavigation(hasUnreadMessages);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleSignOut = () => {
    if (signOut) {
      signOut();
    }
  };

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  // Initialize collapse state notification
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, []);

  return (
    <>
      <SidebarMobile 
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        navItems={navItems}
        currentPath={currentPath}
        isAdmin={isAdmin}
        handleSignOut={handleSignOut}
      />
      
      <SidebarDesktop 
        navItems={navItems}
        currentPath={currentPath}
        isAdmin={isAdmin}
        handleSignOut={handleSignOut}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />
    </>
  );
};

export default Sidebar;
