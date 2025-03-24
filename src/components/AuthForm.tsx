
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LockIcon, UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';

const AuthForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        navigate('/');
        toast.success(`Добро пожаловать, ${username}!`);
      } else {
        setIsLoading(false);
      }
    }, 800); // Short delay for better UX
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-muted/30">
      <Card className="w-full max-w-md mx-auto animate-scale-in glass-card">
        <CardHeader className="space-y-2 flex flex-col items-center">
          <img 
            src="/lovable-uploads/e1dd7c30-e3ad-40c1-b017-be5927100c96.png" 
            alt="Тауасу Демалыс Мекени" 
            className="h-24 mb-2"
          />
          <CardTitle className="text-2xl font-bold text-center">TauAsu</CardTitle>
          <CardDescription className="text-center">
            DEMALYS MEKENI
          </CardDescription>
          <Separator className="my-2" />
          <CardDescription className="text-center">
            Войдите в систему, чтобы получить доступ
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Имя пользователя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
            <div className="text-xs text-muted-foreground text-center w-full mt-6">
              © Все права защищены <span className="opacity-70">@asqartbzrv</span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthForm;
