
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

export interface AppState {
  currentUser: User | null;
  theme: 'light' | 'dark';
  zones: Zone[];
  bookings: Booking[];
  selectedZoneType: ZoneType | 'all';
  selectedDate: string;
  isEditingBooking: boolean;
  currentBooking: Booking | null;
}
