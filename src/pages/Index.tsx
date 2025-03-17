
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
      
      <main className="flex-1 container mx-auto px-4 py-8">
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
        
        <Tabs defaultValue="table" className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="table" className="flex items-center">
              <TableIcon className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Таблица</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center">
              <CalendarDaysIcon className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Календарь</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center">
              <UsersIcon className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Клиенты</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChartIcon className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Аналитика</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="animate-in fade-in-50">
            <BookingTable />
          </TabsContent>
          
          <TabsContent value="calendar" className="animate-in fade-in-50">
            <BookingCalendar />
          </TabsContent>
          
          <TabsContent value="customers" className="animate-in fade-in-50">
            <CustomersDatabase />
          </TabsContent>
          
          <TabsContent value="analytics" className="animate-in fade-in-50">
            <AnalyticsView />
          </TabsContent>
        </Tabs>
        
        <BookingForm 
          isOpen={formOpen || isEditingBooking} 
          onClose={handleCloseForm} 
        />
      </main>
    </div>
  );
};

export default Index;
