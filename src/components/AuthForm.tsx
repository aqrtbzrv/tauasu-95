
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LockIcon, UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Пожалуйста, введите имя пользователя и пароль');
      return;
    }
    
    const success = login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Неверное имя пользователя или пароль');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-muted/30">
      <Card className="w-full max-w-md mx-auto animate-scale-in glass-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">TauAsu</CardTitle>
          <CardDescription className="text-center">
            Войдите в систему, чтобы получить доступ
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Имя пользователя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
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
                  autoComplete="current-password"
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Доступные аккаунты:</p>
              <ul className="pl-5 list-disc space-y-1 mt-2">
                <li>admin / adminadmin (Администратор)</li>
                <li>callcenter / callcenter (Call Center)</li>
                <li>waiter / waiterwaiter (Официант)</li>
                <li>cookcook / cook123 (Повар)</li>
                <li>jako2025 / zhanat2025 (Жанат Молдажан)</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Войти
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthForm;
