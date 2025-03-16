
export type UserRole = 'admin' | 'staff';

export interface User {
  username: string;
  password: string;
  role: UserRole;
}

export type ZoneType = 
  | 'Юрты' 
  | 'Глэмпинг' 
  | 'Беседки' 
  | 'Хан-Шатыр' 
  | 'Летний двор' 
  | 'Террасы' 
  | 'Тапчаны';

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
}

export interface Booking {
  id: string;
  zoneId: string;
  clientName: string;
  rentalCost: number;
  prepayment: number;
  personCount: number;
  dateTime: string;
  menu?: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  notes?: string;
  bookingsCount: number;
  lastBooking: string;
}

export interface AppState {
  // State
  currentUser: User | null;
  theme: 'light' | 'dark';
  zones: Zone[];
  bookings: Booking[];
  customers: Customer[];
  selectedZoneType: ZoneType | 'all';
  selectedDate: string;
  isEditingBooking: boolean;
  currentBooking: Booking | null;
  
  // Auth actions
  login: (username: string, password: string) => boolean;
  logout: () => void;
  
  // Theme actions
  toggleTheme: () => void;
  
  // Supabase synchronization
  fetchBookingsFromSupabase: () => Promise<void>;
  setupRealtimeSubscription: () => void;
  
  // Booking actions
  setSelectedZoneType: (zoneType: ZoneType | 'all') => void;
  setSelectedDate: (date: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBooking: (id: string, bookingData: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  editBooking: (booking: Booking | null) => void;
  
  // Customer actions
  getCustomers: () => Customer[];
  updateCustomerNotes: (phoneNumber: string, notes: string) => Promise<void>;
  
  // Helper methods
  getFilteredBookings: () => Booking[];
  getZoneById: (id: string) => Zone | undefined;
  getZonesByType: (type: ZoneType | 'all') => Zone[];
  isZoneBooked: (zoneId: string, dateTime: string) => boolean;
  getSortedBookings: () => Booking[];
  getBookingsInDateRange: (startDate: Date, endDate: Date) => Booking[];
}
