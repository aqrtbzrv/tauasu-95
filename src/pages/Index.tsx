
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

const Index = () => {
  const { currentUser, editBooking, currentBooking, isEditingBooking } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === 'admin';
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  // If not logged in and initial render, show loading or redirect
  if (!currentUser) {
    return null; // Will redirect via useEffect
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
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
        
        <BookingForm 
          isOpen={formOpen || isEditingBooking} 
          onClose={handleCloseForm} 
        />
      </main>
    </div>
  );
};

export default Index;
