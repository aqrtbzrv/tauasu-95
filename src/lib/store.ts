
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Booking, User, Zone, ZoneType } from './types';
import { toast } from 'sonner';

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
          return true;
        }
        
        toast.error('Неверное имя пользователя или пароль');
        return false;
      },
      
      logout: () => {
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

      // Booking actions
      setSelectedZoneType: (zoneType: ZoneType | 'all') => {
        set({ selectedZoneType: zoneType });
      },
      
      setSelectedDate: (date: string) => {
        set({ selectedDate: date });
      },
      
      addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const newBooking: Booking = {
          ...booking,
          id: `booking_${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          bookings: [...state.bookings, newBooking],
          isEditingBooking: false,
          currentBooking: null,
        }));
        
        toast.success('Бронирование успешно добавлено');
      },
      
      updateBooking: (id: string, bookingData: Partial<Booking>) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id
              ? { ...booking, ...bookingData, updatedAt: new Date().toISOString() }
              : booking
          ),
          isEditingBooking: false,
          currentBooking: null,
        }));
        
        toast.success('Бронирование успешно обновлено');
      },
      
      deleteBooking: (id: string) => {
        set((state) => ({
          bookings: state.bookings.filter((booking) => booking.id !== id),
        }));
        
        toast.success('Бронирование успешно удалено');
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
        bookings: state.bookings,
        theme: state.theme,
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
}
