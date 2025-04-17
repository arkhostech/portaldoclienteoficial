
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard,
  Settings,
  FolderOpen,
  BookOpen,
  LayoutPanelTop
} from 'lucide-react';

export interface NavItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

export const useSidebarNavigation = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

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

  return {
    navItems: isAdmin ? adminNavItems : clientNavItems,
    currentPath: location.pathname,
  };
};
