import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings,
  FolderOpen,
  LayoutPanelTop,
  MessageCircle
} from 'lucide-react';

export interface NavItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  hasNotification?: boolean;
}

export const useSidebarNavigation = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { totalUnread } = useNotifications();

  const adminNavItems = [
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
      title: 'Chat com Clientes', 
      icon: <MessageCircle className="h-5 w-5" />, 
      href: '/admin/messages',
      hasNotification: totalUnread > 0
    },
    { 
      title: 'Estágios Clientes', 
      icon: <LayoutPanelTop className="h-5 w-5" />, 
      href: '/admin/client-stages' 
    },
    { 
      title: 'Configurações', 
      icon: <Settings className="h-5 w-5" />, 
      href: '/admin/settings' 
    }
  ];

  const clientNavItems = [
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
      title: 'Mensagens', 
      icon: <MessageCircle className="h-5 w-5" />, 
      href: '/messages',
      hasNotification: totalUnread > 0
    }
  ];

  return {
    navItems: isAdmin ? adminNavItems : clientNavItems,
    currentPath: location.pathname,
  };
};
