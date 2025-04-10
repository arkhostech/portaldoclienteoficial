
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { user, isAdmin } = useAuth();
  
  // Get user display initials from email or full name
  const getInitials = () => {
    if (!user) return "?";
    
    const fullName = user.user_metadata?.full_name || user.email;
    if (!fullName) return "?";
    
    if (typeof fullName === 'string') {
      return fullName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    return user.email?.substring(0, 2).toUpperCase() || "?";
  };
  
  // Get display name
  const getDisplayName = () => {
    if (!user) return "";
    return user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuário";
  };

  return (
    <header className="flex justify-between items-center p-4 border-b bg-white">
      <h1 className="text-2xl font-bold">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar..." 
            className="pl-10 w-64"
          />
        </div>
        
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white">
            {getInitials()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{getDisplayName()}</p>
            <p className="text-xs text-muted-foreground">{isAdmin ? 'Admin' : 'Cliente'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
