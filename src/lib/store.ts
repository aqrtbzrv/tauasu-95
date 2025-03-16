
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Booking, User, Zone, ZoneType } from './types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// Define our initial zones
const initialZones: Zone[] = [
  { id: 'yurt1', name: 'Юрта 1', type: 'Юрты' },
  { id: 'yurt2', name: 'Юрта 2', type: 'Юрты' },
  { id: 'glamping1', name: 'Глэмпинг', type: 'Глэмпинг' },
  { id: 'gazebo1', name: 'Беседка 1', type: 'Беседки' },
  { id: 'gazebo2', name: 'Беседка 2', type: 'Беседки' },
  { id: 'gazebo3', name: 'Беседка 3', type: 'Беседки' },
  { id: 'gazebo4', name: 'Беседка 4', type: 'Беседки' },
  { id: 'khanShatyr', name: 'Хан-Шатыр', type: 'Хан-Шатыр' },
  { id: 'summerYard', name: 'Летний двор', type: 'Летний двор' },
  { id: 'terrace1', name: 'Терраса 1', type: 'Террасы' },
  { id: 'terrace2', name: 'Терраса 2', type: 'Террасы' },
  { id: 'terrace3', name: 'Терраса 3', type: 'Террасы' },
  { id: 'tapchane1', name: 'Тапчан 1', type: 'Тапчаны' },
  { id: 'tapchane2', name: 'Тапчан 2', type: 'Тапчаны' },
  { id: 'tapchane3', name: 'Тапчан 3', type: 'Тапчаны' },
  { id: 'tapchane4', name: 'Тапчан 4', type: 'Тапчаны' },
];

// Define our users
const users: User[] = [
  { username: 'admin', password: 'adminadmin', role: 'admin' },
  { username: 'person', password: 'personperson', role: 'staff' },
];

// Get today's date in ISO format (YYYY-MM-DD)
const today = new Date().toISOString().split('T')[0];

// Create the store
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      theme: 'light',
      zones: initialZones,
      bookings: [],
      selectedZoneType: 'all',
      selectedDate: today,
      isEditingBooking: false,
      currentBooking: null,

      // Auth actions
      login: (username: string, password: string) => {
        const user = users.find(
          (u) => u.username === username && u.password === password
        );
        
        if (user) {
          set({ currentUser: user });
          toast.success('Успешный вход в систему');
          
          // After login, fetch bookings from Supabase
          get().fetchBookingsFromSupabase();
          
          // Set up realtime subscription
          get().setupRealtimeSubscription();
          
          return true;
        }
        
        toast.error('Неверное имя пользователя или пароль');
        return false;
      },
      
      logout: () => {
        // Remove any existing Supabase subscriptions
        if (window.supabaseSubscription) {
          supabase.removeChannel(window.supabaseSubscription);
          window.supabaseSubscription = null;
        }
        
        set({ currentUser: null });
        toast.success('Вы вышли из системы');
      },

      // Theme actions
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        
        // Update document class for tailwind dark mode
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // Fetch bookings from Supabase
      fetchBookingsFromSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('bookings')
            .select('*');
            
          if (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Ошибка при получении бронирований');
            return;
          }
          
          if (data) {
            const formattedBookings: Booking[] = data.map(booking => ({
              id: booking.id,
              zoneId: booking.venue,
              clientName: booking.client_name,
              rentalCost: booking.rental_price,
              prepayment: booking.prepayment,
              personCount: booking.number_of_people,
              dateTime: booking.date_time,
              menu: booking.menu || undefined,
              phoneNumber: booking.phone_number,
              createdAt: booking.created_at,
              updatedAt: booking.updated_at
            }));
            
            set({ bookings: formattedBookings });
          }
        } catch (error) {
          console.error('Error fetching bookings:', error);
          toast.error('Ошибка при получении бронирований');
        }
      },
      
      // Setup realtime subscription
      setupRealtimeSubscription: () => {
        // Remove any existing subscription
        if (window.supabaseSubscription) {
          supabase.removeChannel(window.supabaseSubscription);
        }
        
        // Create a new subscription
        const channel = supabase
          .channel('bookings-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bookings' },
            (payload) => {
              console.log('Change received:', payload);
              // Refresh all bookings when any change occurs
              get().fetchBookingsFromSupabase();
            }
          )
          .subscribe();
          
        // Store the channel reference globally for cleanup
        window.supabaseSubscription = channel;
      },

      // Booking actions
      setSelectedZoneType: (zoneType: ZoneType | 'all') => {
        set({ selectedZoneType: zoneType });
      },
      
      setSelectedDate: (date: string) => {
        set({ selectedDate: date });
      },
      
      addBooking: async (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
          const now = new Date().toISOString();
          
          // First insert into Supabase
          const { data, error } = await supabase
            .from('bookings')
            .insert({
              venue: booking.zoneId,
              client_name: booking.clientName,
              rental_price: booking.rentalCost,
              prepayment: booking.prepayment,
              number_of_people: booking.personCount,
              date_time: booking.dateTime,
              menu: booking.menu,
              phone_number: booking.phoneNumber,
              service_type: get().getZoneById(booking.zoneId)?.type || 'Unknown'
            })
            .select();
            
          if (error) {
            console.error('Error adding booking:', error);
            toast.error('Ошибка при добавлении бронирования');
            return;
          }
          
          if (data && data[0]) {
            // Format the booking for local state
            const newBooking: Booking = {
              id: data[0].id,
              zoneId: data[0].venue,
              clientName: data[0].client_name,
              rentalCost: data[0].rental_price,
              prepayment: data[0].prepayment,
              personCount: data[0].number_of_people,
              dateTime: data[0].date_time,
              menu: data[0].menu || undefined,
              phoneNumber: data[0].phone_number,
              createdAt: data[0].created_at,
              updatedAt: data[0].updated_at
            };
            
            // Update local state
            set((state) => ({
              bookings: [...state.bookings, newBooking],
              isEditingBooking: false,
              currentBooking: null,
            }));
            
            toast.success('Бронирование успешно добавлено');
          }
        } catch (error) {
          console.error('Error adding booking:', error);
          toast.error('Ошибка при добавлении бронирования');
        }
      },
      
      updateBooking: async (id: string, bookingData: Partial<Booking>) => {
        try {
          // Prepare data for Supabase update
          const updateData: any = {};
          
          if (bookingData.zoneId) updateData.venue = bookingData.zoneId;
          if (bookingData.clientName) updateData.client_name = bookingData.clientName;
          if (bookingData.rentalCost !== undefined) updateData.rental_price = bookingData.rentalCost;
          if (bookingData.prepayment !== undefined) updateData.prepayment = bookingData.prepayment;
          if (bookingData.personCount !== undefined) updateData.number_of_people = bookingData.personCount;
          if (bookingData.dateTime) updateData.date_time = bookingData.dateTime;
          if (bookingData.menu !== undefined) updateData.menu = bookingData.menu;
          if (bookingData.phoneNumber) updateData.phone_number = bookingData.phoneNumber;
          
          // Set update timestamp
          updateData.updated_at = new Date().toISOString();
          
          // Update in Supabase
          const { error } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('id', id);
            
          if (error) {
            console.error('Error updating booking:', error);
            toast.error('Ошибка при обновлении бронирования');
            return;
          }
          
          // Update local state
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking.id === id
                ? { ...booking, ...bookingData, updatedAt: updateData.updated_at }
                : booking
            ),
            isEditingBooking: false,
            currentBooking: null,
          }));
          
          toast.success('Бронирование успешно обновлено');
        } catch (error) {
          console.error('Error updating booking:', error);
          toast.error('Ошибка при обновлении бронирования');
        }
      },
      
      deleteBooking: async (id: string) => {
        try {
          // Delete from Supabase
          const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);
            
          if (error) {
            console.error('Error deleting booking:', error);
            toast.error('Ошибка при удалении бронирования');
            return;
          }
          
          // Update local state
          set((state) => ({
            bookings: state.bookings.filter((booking) => booking.id !== id),
          }));
          
          toast.success('Бронирование успешно удалено');
        } catch (error) {
          console.error('Error deleting booking:', error);
          toast.error('Ошибка при удалении бронирования');
        }
      },
      
      editBooking: (booking: Booking | null) => {
        set({
          isEditingBooking: booking !== null,
          currentBooking: booking,
        });
      },

      // Helper methods
      getFilteredBookings: () => {
        const { bookings, selectedZoneType, selectedDate, zones } = get();
        
        return bookings.filter((booking) => {
          const bookingDate = booking.dateTime.split('T')[0];
          const zone = zones.find((z) => z.id === booking.zoneId);
          
          if (!zone) return false;
          
          if (selectedDate && bookingDate !== selectedDate) {
            return false;
          }
          
          if (selectedZoneType !== 'all' && zone.type !== selectedZoneType) {
            return false;
          }
          
          return true;
        });
      },

      getZoneById: (id: string) => {
        return get().zones.find((zone) => zone.id === id);
      },

      getZonesByType: (type: ZoneType | 'all') => {
        const { zones } = get();
        
        if (type === 'all') {
          return zones;
        }
        
        return zones.filter((zone) => zone.type === type);
      },

      isZoneBooked: (zoneId: string, dateTime: string) => {
        const { bookings } = get();
        const bookingDate = dateTime.split('T')[0];
        
        return bookings.some((booking) => {
          const existingBookingDate = booking.dateTime.split('T')[0];
          return booking.zoneId === zoneId && existingBookingDate === bookingDate;
        });
      },
    }),
    {
      name: 'tauasu-booking-storage',
      partialize: (state) => ({
        theme: state.theme,
        currentUser: state.currentUser,
      }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const theme = useStore.getState().theme;
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Check if user is logged in from storage and set up subscription
  const currentUser = useStore.getState().currentUser;
  if (currentUser) {
    // Fetch initial bookings and set up subscription
    useStore.getState().fetchBookingsFromSupabase();
    useStore.getState().setupRealtimeSubscription();
  }
}

// Declare the global type for the supabase subscription
declare global {
  interface Window {
    supabaseSubscription: any;
  }
}
