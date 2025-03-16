
import React from 'react';
import { useStore } from '@/lib/store';
import ThemeToggle from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { LogOutIcon, UserIcon } from 'lucide-react';

const Header = () => {
  const currentUser = useStore((state) => state.currentUser);
  const logout = useStore((state) => state.logout);

  return (
    <header className="border-b sticky top-0 z-10 w-full bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            TauAsu
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {currentUser && (
            <div className="flex items-center space-x-2 text-sm mr-2">
              <UserIcon className="h-4 w-4" />
              <span className="font-medium">
                {currentUser.role === 'admin' ? 'Администратор' : 'Персонал'}
              </span>
            </div>
          )}
          
          <ThemeToggle />
          
          {currentUser && (
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOutIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
