
import { useState } from 'react';
import { useAuth } from "@/contexts/auth";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard,
  Settings,
  FolderOpen,
  BookOpen,
  LogOut
} from 'lucide-react';
import { useSidebarNavigation } from '@/hooks/useSidebarNavigation';
import SidebarMobile from './SidebarMobile';
import SidebarDesktop from './SidebarDesktop';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { isAdmin, signOut } = useAuth();
  const { navItems, currentPath } = useSidebarNavigation();
  
  const handleSignOut = () => {
    if (signOut) {
      signOut();
    }
  };

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
      />
    </>
  );
};

export default Sidebar;
