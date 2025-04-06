import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Booking, Customer, Notification, User, Zone, ZoneType } from './types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import * as XLSX from 'xlsx';

// Define our initial zones
const initialZones: Zone[] = [
  { id: 'yurt1', name: 'Юрта 1', type: 'Юрты' },
  { id: 'yurt2', name: 'Юрта 2', type: 'Юрты' },
  { id: 'glamping1', name: 'Глэмпинг', type: 'Глэмпинг' },
  { id: 'gazebo2', name: 'Беседка 2', type: 'Беседки' },
  { id: 'gazebo3', name: 'Беседка 3', type: 'Беседки' },
  { id: 'gazebo4', name: 'Беседка 4', type: 'Беседки' },
  { id: 'gazebo5', name: 'Беседка 5', type: 'Беседки' },
  { id: 'khanShatyr', name: 'Хан-Шатыр', type: 'Хан-Шатыр' },
  { id: 'summerYard', name: 'Летний двор', type: 'Летний двор' },
  { id: 'terrace1', name: 'Терраса 1', type: 'Террасы' },
  { id: 'terrace2', name: 'Терраса 2', type: 'Террасы' },
  { id: 'terrace3', name: 'Терраса 3', type: 'Террасы' },
  { id: 'tapchane1', name: 'Тапчан 1', type: 'Тапчаны' },
  { id: 'tapchane2', name: 'Тапчан 2', type: 'Тапчаны' },
  { id: 'tapchane3', name: 'Тапчан 3', type: 'Тапчаны' },
  { id: 'tapchane4', name: 'Тапчан 4', type: 'Тапчаны' },
  { id: 'other', name: 'Другое', type: 'Другое' },
];

// Define our users
const users: User[] = [
  { username: 'admin', password: 'adminadmin', role: 'admin', displayName: 'Администратор' },
  { username: 'callcenter', password: 'callcenter', role: 'admin', displayName: 'Call Center' },
  { username: 'waiter', password: 'waiterwaiter', role: 'staff', displayName: 'Официант' },
  { username: 'cookcook', password: 'cook123', role: 'staff', displayName: 'Повар' },
  { username: 'jako2025', password: 'zhanat2025', role: 'staff', displayName: 'Жанат Молдажан' },
  { username: 'miras2025', password: 'mirasadmin', role: 'admin', displayName: 'Мирас Болатбаев' },
  { username: 'qurmet2025', password: 'qurmetadmin', role: 'admin', displayName: 'Құрмет Болатбаев' },
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
      customers: [],
      notifications: [],
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
              updatedAt: booking.updated_at,
              waiterViewed: booking.waiter_viewed ?? false,
              cookViewed: booking.cook_viewed ?? false,
              waiterViewedAt: booking.waiter_viewed_at ?? undefined,
              cookViewedAt: booking.cook_viewed_at ?? undefined,
              closed: booking.closed ?? false,
              closedBy: booking.closed_by ?? undefined,
              closedAt: booking.closed_at ?? undefined,
              createdBy: booking.created_by ?? undefined
            }));
            
            // Sort bookings by date (from nearest to furthest)
            const sortedBookings = formattedBookings.sort((a, b) => {
              return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
            });
            
            set({ bookings: sortedBookings });
            
            // Get customer notes from localStorage
            const storedCustomerNotes = localStorage.getItem('customerNotes');
            const customerNotes = storedCustomerNotes ? JSON.parse(storedCustomerNotes) : {};
            
            // Generate customers list from bookings
            const customersMap = new Map<string, Customer>();
            
            formattedBookings.forEach(booking => {
              const existingCustomer = customersMap.get(booking.phoneNumber);
              const lastBookingDate = existingCustomer ? 
                (isAfter(new Date(booking.dateTime), new Date(existingCustomer.lastBooking)) ? 
                  booking.dateTime : existingCustomer.lastBooking) : 
                booking.dateTime;
              
              customersMap.set(booking.phoneNumber, {
                id: booking.phoneNumber,
                name: booking.clientName,
                phoneNumber: booking.phoneNumber,
                notes: customerNotes[booking.phoneNumber] || existingCustomer?.notes || '',
                bookingsCount: (existingCustomer?.bookingsCount || 0) + 1,
                lastBooking: lastBookingDate
              });
            });
            
            set({ customers: Array.from(customersMap.values()) });
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

      // Notification actions
      getNotifications: () => {
        return get().notifications.filter(notification => 
          notification.forUsername === get().currentUser?.username || 
          notification.forUsername === 'all'
        ).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      
      markNotificationAsRead: (id: string) => {
        set(state => ({
          notifications: state.notifications.map(notification => 
            notification.id === id ? { ...notification, read: true } : notification
          )
        }));
      },
      
      markAllNotificationsAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(notification => 
            notification.forUsername === get().currentUser?.username || notification.forUsername === 'all'
              ? { ...notification, read: true } 
              : notification
          )
        }));
      },

      // Booking actions
      setSelectedZoneType: (zoneType: ZoneType | 'all') => {
        set({ selectedZoneType: zoneType });
      },
      
      setSelectedDate: (date: string) => {
        set({ selectedDate: date });
      },
      
      addBooking: async (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'waiterViewed' | 'cookViewed' | 'waiterViewedAt' | 'cookViewedAt' | 'closed' | 'closedBy' | 'closedAt'>) => {
        try {
          const now = new Date().toISOString();
          const currentUser = get().currentUser;
          
          // First insert into Supabase - don't modify the dateTime value
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
              service_type: get().getZoneById(booking.zoneId)?.type || 'Unknown',
              waiter_viewed: false,
              cook_viewed: false,
              closed: false,
              created_by: currentUser?.username
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
              updatedAt: data[0].updated_at,
              waiterViewed: data[0].waiter_viewed ?? false,
              cookViewed: data[0].cook_viewed ?? false,
              waiterViewedAt: data[0].waiter_viewed_at ?? undefined,
              cookViewedAt: data[0].cook_viewed_at ?? undefined,
              closed: data[0].closed ?? false,
              closedBy: data[0].closed_by ?? undefined,
              closedAt: data[0].closed_at ?? undefined,
              createdBy: data[0].created_by ?? currentUser?.username
            };
            
            // Create notifications for all users except the one who created the booking
            const notifications: Notification[] = [];
            
            users.forEach(user => {
              if (user.username !== currentUser?.username) {
                notifications.push({
                  id: uuidv4(),
                  type: 'booking_created',
                  bookingId: newBooking.id,
                  message: `${currentUser?.displayName || currentUser?.username || 'Пользователь'} создал(а) новое бронирование для ${newBooking.clientName} на ${format(new Date(newBooking.dateTime), 'dd.MM.yyyy HH:mm')}`,
                  createdAt: now,
                  read: false,
                  forUsername: user.username
                });
              }
            });
            
            // Update local state
            set((state) => {
              // Update customers list
              const customersMap = new Map<string, Customer>();
              state.customers.forEach(c => customersMap.set(c.phoneNumber, c));
              
              const existingCustomer = customersMap.get(newBooking.phoneNumber);
              const customer: Customer = {
                id: newBooking.phoneNumber,
                name: newBooking.clientName,
                phoneNumber: newBooking.phoneNumber,
                notes: existingCustomer?.notes || '',
                bookingsCount: (existingCustomer?.bookingsCount || 0) + 1,
                lastBooking: newBooking.dateTime
              };
              
              customersMap.set(newBooking.phoneNumber, customer);
              
              // Sort bookings by date (from nearest to furthest)
              const sortedBookings = [...state.bookings, newBooking].sort((a, b) => {
                return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
              });
              
              return {
                bookings: sortedBookings,
                customers: Array.from(customersMap.values()),
                notifications: [...state.notifications, ...notifications],
                isEditingBooking: false,
                currentBooking: null,
              };
            });
            
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
          if (bookingData.waiterViewed !== undefined) updateData.waiter_viewed = bookingData.waiterViewed;
          if (bookingData.cookViewed !== undefined) updateData.cook_viewed = bookingData.cookViewed;
          if (bookingData.waiterViewedAt !== undefined) updateData.waiter_viewed_at = bookingData.waiterViewedAt;
          if (bookingData.cookViewedAt !== undefined) updateData.cook_viewed_at = bookingData.cookViewedAt;
          if (bookingData.closed !== undefined) updateData.closed = bookingData.closed;
          if (bookingData.closedBy !== undefined) updateData.closed_by = bookingData.closedBy;
          if (bookingData.closedAt !== undefined) updateData.closed_at = bookingData.closedAt;
          
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
          set((state) => {
            const updatedBookings = state.bookings.map((booking) =>
              booking.id === id
                ? { ...booking, ...bookingData, updatedAt: updateData.updated_at }
                : booking
            );
            
            // Sort bookings by date (from nearest to furthest)
            const sortedBookings = [...updatedBookings].sort((a, b) => {
              return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
            });
            
            // Recalculate customers based on updated bookings
            const customersMap = new Map<string, Customer>();
            
            state.customers.forEach(c => customersMap.set(c.phoneNumber, {
              ...c,
              bookingsCount: 0,
              lastBooking: ''
            }));
            
            sortedBookings.forEach(booking => {
              const existingCustomer = customersMap.get(booking.phoneNumber) || {
                id: booking.phoneNumber,
                name: booking.clientName,
                phoneNumber: booking.phoneNumber,
                notes: '',
                bookingsCount: 0,
                lastBooking: booking.dateTime
              };
              
              const lastBookingDate = existingCustomer.lastBooking ? 
                (isAfter(new Date(booking.dateTime), new Date(existingCustomer.lastBooking)) ? 
                  booking.dateTime : existingCustomer.lastBooking) : 
                booking.dateTime;
              
              customersMap.set(booking.phoneNumber, {
                ...existingCustomer,
                name: booking.clientName, // Update name to latest
                bookingsCount: existingCustomer.bookingsCount + 1,
                lastBooking: lastBookingDate
              });
            });
            
            return {
              bookings: sortedBookings,
              customers: Array.from(customersMap.values()),
              isEditingBooking: false,
              currentBooking: null,
            };
          });
          
          toast.success('Бронирование успешно обновлено');
        } catch (error) {
          console.error('Error updating booking:', error);
          toast.error('Ошибка при обновлении бронирования');
        }
      },
      
      closeBooking: async (id: string) => {
        try {
          const now = new Date().toISOString();
          const currentUser = get().currentUser;
          
          if (!currentUser) {
            toast.error('Вы должны быть авторизованы для закрытия бронирования');
            return;
          }
          
          // Update in Supabase
          const { error } = await supabase
            .from('bookings')
            .update({
              closed: true,
              closed_by: currentUser.username,
              closed_at: now,
              updated_at: now
            })
            .eq('id', id);
            
          if (error) {
            console.error('Error closing booking:', error);
            toast.error('Ошибка при закрытии бронирования');
            return;
          }
          
          // Get the booking to create notifications
          const booking = get().bookings.find(b => b.id === id);
          const notifications: Notification[] = [];
          
          if (booking) {
            users.forEach(user => {
              if (user.username !== currentUser.username) {
                notifications.push({
                  id: uuidv4(),
                  type: 'booking_closed',
                  bookingId: id,
                  message: `${currentUser.displayName || currentUser.username} закрыл(а) бронирование для ${booking.clientName} на ${format(new Date(booking.dateTime), 'dd.MM.yyyy HH:mm')}`,
                  createdAt: now,
                  read: false,
                  forUsername: user.username
                });
              }
            });
          }
          
          // Update local state
          set((state) => {
            const updatedBookings = state.bookings.map((booking) =>
              booking.id === id
                ? { 
                    ...booking, 
                    closed: true, 
                    closedBy: currentUser.username, 
                    closedAt: now,
                    updatedAt: now
                  }
                : booking
            );
            
            return {
              bookings: updatedBookings,
              notifications: [...state.notifications, ...notifications]
            };
          });
          
          toast.success('Бронирование успешно закрыто');
        } catch (error) {
          console.error('Error closing booking:', error);
          toast.error('Ошибка при закрытии бронирования');
        }
      },
      
      markAsViewed: async (id: string, role: 'waiter' | 'cook') => {
        try {
          const now = new Date().toISOString();
          const updateData: any = {
            updated_at: now
          };
          
          if (role === 'waiter') {
            updateData.waiter_viewed = true;
            updateData.waiter_viewed_at = now;
          } else if (role === 'cook') {
            updateData.cook_viewed = true;
            updateData.cook_viewed_at = now;
          }
          
          // Update in Supabase
          const { error } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('id', id);
            
          if (error) {
            console.error(`Error marking booking as viewed by ${role}:`, error);
            toast.error(`Ошибка при отметке просмотра бронирования`);
            return;
          }
          
          // Update local state
          set((state) => {
            const updatedBookings = state.bookings.map((booking) => {
              if (booking.id === id) {
                const updatedBooking = { ...booking };
                
                if (role === 'waiter') {
                  updatedBooking.waiterViewed = true;
                  updatedBooking.waiterViewedAt = now;
                } else if (role === 'cook') {
                  updatedBooking.cookViewed = true;
                  updatedBooking.cookViewedAt = now;
                }
                
                updatedBooking.updatedAt = now;
                return updatedBooking;
              }
              return booking;
            });
            
            return { bookings: updatedBookings };
          });
          
          toast.success(`Бронирование отмечено как просмотренное ${role === 'waiter' ? 'официантом' : 'поваром'}`);
        } catch (error) {
          console.error(`Error marking booking as viewed by ${role}:`, error);
          toast.error(`Ошибка при отметке просмотра бронирования`);
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
          set((state) => {
            const deletedBooking = state.bookings.find(booking => booking.id === id);
            const remainingBookings = state.bookings.filter((booking) => booking.id !== id);
            
            // Recalculate customers
            const customersMap = new Map<string, Customer>();
            
            state.customers.forEach(c => customersMap.set(c.phoneNumber, {
              ...c,
              bookingsCount: 0,
              lastBooking: ''
            }));
            
            remainingBookings.forEach(booking => {
              const existingCustomer = customersMap.get(booking.phoneNumber) || {
                id: booking.phoneNumber,
                name: booking.clientName,
                phoneNumber: booking.phoneNumber,
                notes: '',
                bookingsCount: 0,
                lastBooking: booking.dateTime
              };
              
              const lastBookingDate = existingCustomer.lastBooking ? 
                (isAfter(new Date(booking.dateTime), new Date(existingCustomer.lastBooking)) ? 
                  booking.dateTime : existingCustomer.lastBooking) : 
                booking.dateTime;
              
              customersMap.set(booking.phoneNumber, {
                ...existingCustomer,
                name: booking.clientName,
                bookingsCount: existingCustomer.bookingsCount + 1,
                lastBooking: lastBookingDate
              });
            });
            
            // Remove customer if no bookings left
            if (deletedBooking) {
              const customer = customersMap.get(deletedBooking.phoneNumber);
              if (customer && customer.bookingsCount === 0) {
                customersMap.delete(deletedBooking.phoneNumber);
              }
            }
            
            return {
              bookings: remainingBookings,
              customers: Array.from(customersMap.values())
            };
          });
          
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

      // Customer actions
      getCustomers: () => {
        return get().customers;
      },
      
      updateCustomerNotes: async (phoneNumber: string, notes: string) => {
        set((state) => {
          const updatedCustomers = state.customers.map(customer => 
            customer.phoneNumber === phoneNumber 
              ? { ...customer, notes }
              : customer
          );
          
          // Save notes to localStorage for persistent storage
          const storedCustomerNotes = localStorage.getItem('customerNotes');
          const customerNotes = storedCustomerNotes ? JSON.parse(storedCustomerNotes) : {};
          
          // Update the notes
          customerNotes[phoneNumber] = notes;
          
          localStorage.setItem('customerNotes', JSON.stringify(customerNotes));
          
          return { customers: updatedCustomers };
        });
        
        toast.success('Примечание о клиенте обновлено');
      },
      
      exportCustomersToExcel: () => {
        const customers = get().customers;
        
        // Преобразуем данные для Excel
        const data = customers.map(customer => ({
          'Имя клиента': customer.name,
          'Номер телефона': customer.phoneNumber,
          'Количество бронирований': customer.bookingsCount,
          'Последнее бронирование': format(new Date(customer.lastBooking), 'dd.MM.yyyy HH:mm'),
          'Примечания': customer.notes || ''
        }));
        
        // Создаем новую книгу Excel
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        
        // Задаем ширину столбцов
        const columnWidths = [
          { wch: 25 }, // Имя
          { wch: 20 }, // Номер телефона
          { wch: 15 }, // Количество бронирований
          { wch: 25 }, // Последнее бронирование
          { wch: 40 }  // Примечания
        ];
        worksheet['!cols'] = columnWidths;
        
        // Добавляем лист в книгу
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Клиенты');
        
        // Генерируем Excel-файл и скачиваем его
        const currentDate = format(new Date(), 'dd-MM-yyyy');
        XLSX.writeFile(workbook, `Клиенты_Тауасу_${currentDate}.xlsx`);
        
        toast.success('Данные клиентов успешно экспортированы');
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

      getSortedBookings: () => {
        const { bookings } = get();
        return [...bookings].sort((a, b) => {
          const dateA = new Date(a.dateTime);
          const dateB = new Date(b.dateTime);
          return dateA.getTime() - dateB.getTime();
        });
      },
      
      getBookingsInDateRange: (startDate: Date, endDate: Date) => {
        const { bookings } = get();
        return bookings.filter(booking => {
          const bookingDate = new Date(booking.dateTime);
          return (isAfter(bookingDate, startDate) || isEqual(bookingDate, startDate)) && 
                 (isBefore(bookingDate, endDate) || isEqual(bookingDate, endDate));
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
