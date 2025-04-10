
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FolderOpen, 
  MessageSquare, 
  CreditCard,
  BookOpen,
  Menu,
  LogOut
} from 'lucide-react';

const navItems = [
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

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} h-screen bg-sidebar flex flex-col fixed left-0 top-0 transition-all duration-300 z-20`}>
      <div className="flex justify-between items-center p-4">
        {!collapsed && <h1 className="text-sidebar-foreground text-xl font-bold">Portal Cliente</h1>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
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
                      ? 'bg-white text-sidebar-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
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
          <Link to="/">
            <Button 
              variant="outline" 
              className={`w-full bg-transparent border-sidebar-foreground text-sidebar-foreground hover:bg-sidebar-accent ${collapsed ? 'justify-center p-2' : ''}`}
            >
              <LogOut className="h-5 w-5 mr-2" />
              {!collapsed && <span>Sair</span>}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
