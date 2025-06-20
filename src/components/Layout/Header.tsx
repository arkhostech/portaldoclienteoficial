
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  toggleSidebar: () => void;
}

const Header = ({ title, toggleSidebar }: HeaderProps) => {
  const { user } = useAuth();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 py-2 sm:py-4 px-4 sm:px-6 flex justify-between items-center">
      <div className="flex items-center truncate">
        <button 
          className="mr-3 sm:mr-4 sm:hidden" 
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 
          className="text-base sm:text-lg md:text-xl font-semibold truncate"
          style={{ 
            color: title === "Central de Mensagens" ? '#14140F' : 'inherit' 
          }}
        >
          {title}
        </h1>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right">
              <p className="text-xs sm:text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-gray-500">Cliente</p>
            </div>
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
              <AvatarFallback className="text-xs sm:text-sm">
                {getInitials(user.email || "User")}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
