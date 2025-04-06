
import React from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { CircleUserRound, LogOut, MoonIcon, SunIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationsList from './NotificationsList';

const Header = () => {
  const { currentUser, logout, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className="bg-white dark:bg-gray-950 shadow-sm border-b z-10">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <div className="font-bold text-lg sm:text-xl text-green-600 dark:text-green-500 whitespace-nowrap">
          TauAsu demalys mekeni
        </div>
        
        <div className="flex items-center gap-2">
          {currentUser && <NotificationsList />}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </Button>
          
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center">
                <div className="flex items-center gap-2 border px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                  <CircleUserRound className="h-5 w-5 text-green-600 dark:text-green-500" />
                  <span className="font-medium text-sm">
                    {currentUser.displayName || currentUser.username}
                  </span>
                </div>
              </div>
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-1"
            >
              <CircleUserRound className="h-4 w-4" />
              <span>Войти</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
