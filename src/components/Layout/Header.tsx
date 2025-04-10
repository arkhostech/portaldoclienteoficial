
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
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
            JD
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">João Doe</p>
            <p className="text-xs text-muted-foreground">Cliente</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
