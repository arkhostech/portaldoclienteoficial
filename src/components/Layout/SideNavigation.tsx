
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  UserCog,
  ListTodo,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";

export default function SideNavigation() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const clientMenuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Documentos",
      href: "/documents",
      icon: FileText,
    },
  ];

  const adminMenuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Clientes",
      href: "/admin/clients",
      icon: UserCog,
    },
    {
      name: "Documentos",
      href: "/admin/documents",
      icon: FileText,
    },

    {
      name: "Etapas",
      href: "/admin/client-stages",
      icon: ListTodo,
    },
    {
      name: "Configurações",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const menuItems = isAdmin ? adminMenuItems : clientMenuItems;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "border-r bg-background transition-all duration-300 ease-in-out h-screen flex flex-col sticky top-0",
        isCollapsed ? "w-[80px]" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b">
        <h2
          className={cn(
            "font-semibold text-lg transition-opacity duration-200",
            isCollapsed && "opacity-0 w-0"
          )}
        >
          Legacy Imigra
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? "→" : "←"}
        </Button>
      </div>
      <div className="flex-grow overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                location.pathname === item.href &&
                  "bg-accent text-accent-foreground font-medium",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon
                className={cn("h-4 w-4", isCollapsed && "h-5 w-5")}
              />
              <span
                className={cn(
                  isCollapsed && "hidden",
                  "transition-opacity duration-200"
                )}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};
