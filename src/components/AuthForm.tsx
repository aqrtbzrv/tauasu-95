
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LockIcon, UserIcon, InfoIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from 'sonner';

const AuthForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      navigate('/');
    }
  };

  const setCredentials = (username: string, password: string) => {
    setUsername(username);
    setPassword(password);
    toast.info('Учетные данные заполнены, нажмите "Войти"');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md mx-auto animate-scale-in glass-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">TauAsu</CardTitle>
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
                />
              </div>
            </div>
            
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="accounts">
                <AccordionTrigger className="text-sm flex items-center">
                  <InfoIcon className="h-4 w-4 mr-2" />
                  Доступные аккаунты
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm space-y-3 p-2 bg-muted/50 rounded-md">
                    <div className="border-b pb-2">
                      <h3 className="font-medium mb-1">Административный доступ:</h3>
                      <div className="grid grid-cols-2 gap-1">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="text-xs justify-start"
                          onClick={() => setCredentials('admin', 'adminadmin')}
                        >
                          admin / adminadmin
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="text-xs justify-start"
                          onClick={() => setCredentials('callcenter', 'callcenter')}
                        >
                          callcenter / callcenter
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Персональный доступ:</h3>
                      <div className="grid grid-cols-2 gap-1">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="text-xs justify-start"
                          onClick={() => setCredentials('waiter', 'waiterwaiter')}
                        >
                          waiter / waiterwaiter
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="text-xs justify-start"
                          onClick={() => setCredentials('cookcook', 'cook123')}
                        >
                          cookcook / cook123
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="text-xs justify-start"
                          onClick={() => setCredentials('jako2025', 'zhanat2025')}
                        >
                          jako2025 / zhanat2025
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
