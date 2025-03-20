
import React from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ThemeToggle from './ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  currentTime?: string;
}

const Header = ({ currentTime }: HeaderProps) => {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/e1dd7c30-e3ad-40c1-b017-be5927100c96.png" 
            alt="Тауасу Демалыс Мекени" 
            className="h-10 md:h-12 mr-2"
          />
          <div className="flex flex-col">
            <span className="font-bold text-base md:text-xl">Tau Asu</span>
            <span className="text-xs md:text-sm text-muted-foreground">DEMALYS MEKENI</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {currentTime && (
            <div className="hidden md:block text-sm font-medium mr-3 bg-muted/40 p-2 rounded">
              {currentTime}
            </div>
          )}
          <ThemeToggle />
          
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-1">
                  <UserCircle className="h-5 w-5 mr-1" />
                  {!isMobile && <span>{currentUser.displayName || currentUser.username}</span>}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-muted-foreground">
                  Роль: {currentUser.role === 'admin' ? 'Администратор' : 'Персонал'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
