
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  FolderOpen, 
  MessageSquare, 
  CreditCard,
  BookOpen,
  Menu,
  LogOut,
  Users,
  Settings,
  BarChart
} from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isAdmin, signOut } = useAuth();

  // Define menu items based on user role
  const navItems = isAdmin 
    ? [
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
          title: 'Processos', 
          icon: <FolderOpen className="h-5 w-5" />, 
          href: '/admin/cases' 
        },
        { 
          title: 'Mensagens', 
          icon: <MessageSquare className="h-5 w-5" />, 
          href: '/messages' 
        },
        { 
          title: 'Relatórios', 
          icon: <BarChart className="h-5 w-5" />, 
          href: '/admin/reports' 
        },
        { 
          title: 'Configurações', 
          icon: <Settings className="h-5 w-5" />, 
          href: '/admin/settings' 
        }
      ]
    : [
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
          icon: <MessageSquare className="h-5 w-5" />, 
          href: '/messages' 
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

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} h-screen bg-secondary flex flex-col fixed left-0 top-0 transition-all duration-300 z-20`}>
      <div className="flex justify-between items-center p-4">
        {!collapsed && <h1 className="text-white text-xl font-bold">{isAdmin ? 'Admin Portal' : 'Portal Cliente'}</h1>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-accent hover:text-secondary"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <nav className="mt-4 px-2">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link 
                  to={item.href} 
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors
                    ${location.pathname === item.href 
                      ? 'bg-accent text-secondary font-medium' 
                      : 'text-white hover:bg-white/10'
                    }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4">
          <Button 
            variant="outline" 
            className={`w-full bg-transparent border-white text-white hover:bg-accent hover:text-secondary hover:border-accent ${collapsed ? 'justify-center p-2' : ''}`}
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
