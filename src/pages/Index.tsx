import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import AuthForm from '@/components/AuthForm';
import Header from '@/components/Header';
import ZoneFilter from '@/components/ZoneFilter';
import BookingTable from '@/components/BookingTable';
import BookingCalendar from '@/components/BookingCalendar';
import BookingForm from '@/components/BookingForm';
import CustomersDatabase from '@/components/CustomersDatabase';
import AnalyticsView from '@/components/AnalyticsView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  PlusIcon, 
  CalendarDaysIcon, 
  TableIcon, 
  UsersIcon, 
  BarChartIcon 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Index = () => {
  const { currentUser, editBooking, currentBooking, isEditingBooking } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === 'admin';
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  if (!currentUser) {
    return null;
  }
  
  const handleAddBooking = () => {
    editBooking(null);
    setFormOpen(true);
  };
  
  const handleCloseForm = () => {
    if (isEditingBooking) {
      editBooking(null);
    }
    setFormOpen(false);
  };

  const formattedTime = format(
    currentTime,
    'dd MMM yyyy HH:mm',
    { locale: ru }
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentTime={formattedTime} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Управление бронированиями</h1>
          {isAdmin && (
            <Button onClick={handleAddBooking} className="shrink-0">
              <PlusIcon className="mr-2 h-4 w-4" />
              Новое бронирование
            </Button>
          )}
        </div>
        
        <ZoneFilter />
        
        <div className="mt-6 rounded-lg bg-card shadow-md border overflow-hidden">
          <Tabs defaultValue="table" className="w-full">
            <div className="p-1.5 bg-muted/50 rounded-t-lg border-b">
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-1.5 p-1 h-auto bg-transparent">
                <TabsTrigger 
                  value="table" 
                  className="flex items-center py-3 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <TableIcon className="mr-2 h-4 w-4" />
                  <span className="whitespace-nowrap">Таблица</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="calendar" 
                  className="flex items-center py-3 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <CalendarDaysIcon className="mr-2 h-4 w-4" />
                  <span className="whitespace-nowrap">Календарь</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="customers" 
                  className="flex items-center py-3 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <UsersIcon className="mr-2 h-4 w-4" />
                  <span className="whitespace-nowrap">Клиенты</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center py-3 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <BarChartIcon className="mr-2 h-4 w-4" />
                  <span className="whitespace-nowrap">Аналитика</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-4">
              <TabsContent value="table" className="animate-in fade-in-50 m-0">
                <BookingTable />
              </TabsContent>
              
              <TabsContent value="calendar" className="animate-in fade-in-50 m-0">
                <BookingCalendar />
              </TabsContent>
              
              <TabsContent value="customers" className="animate-in fade-in-50 m-0">
                <CustomersDatabase />
              </TabsContent>
              
              <TabsContent value="analytics" className="animate-in fade-in-50 m-0">
                <AnalyticsView />
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        {isAdmin && (
          <BookingForm 
            isOpen={formOpen || isEditingBooking} 
            onClose={handleCloseForm} 
          />
        )}
      </main>

      <footer className="w-full py-4 px-6 bg-muted/30 border-t mt-auto">
        <div className="container mx-auto text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Все права защищены. @asqartbzrv
        </div>
      </footer>
    </div>
  );
};

export default Index;
