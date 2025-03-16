
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { EditIcon, FilterIcon, InfoIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Booking } from '@/lib/types';

const BookingTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const getSortedBookings = useStore((state) => state.getSortedBookings);
  const getZoneById = useStore((state) => state.getZoneById);
  const editBooking = useStore((state) => state.editBooking);
  const deleteBooking = useStore((state) => state.deleteBooking);
  const selectedDate = useStore((state) => state.selectedDate);
  const selectedZoneType = useStore((state) => state.selectedZoneType);
  const currentUser = useStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === 'admin';
  
  // Get sorted bookings
  const bookings = getSortedBookings();
  
  // Filter bookings by date and zone type if selected
  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchQuery.toLowerCase();
    const bookingDate = booking.dateTime.split('T')[0];
    const zone = getZoneById(booking.zoneId);
    
    const matchesSearch = booking.clientName.toLowerCase().includes(searchLower) ||
                           booking.phoneNumber.includes(searchQuery) ||
                           (zone?.name.toLowerCase().includes(searchLower) || false);
    
    const matchesDate = selectedDate === 'all' || bookingDate === selectedDate;
    const matchesZoneType = selectedZoneType === 'all' || zone?.type === selectedZoneType;
    
    return matchesSearch && matchesDate && matchesZoneType;
  });

  const formatDate = (dateTime: string) => {
    const date = parseISO(dateTime);
    return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = (booking: Booking) => {
    editBooking(booking);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это бронирование?')) {
      deleteBooking(id);
    }
  };

  const handleRowClick = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const closeDetails = () => {
    setSelectedBooking(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени клиента или номеру телефона..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border glass-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Зона</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead className="hidden md:table-cell">Телефон</TableHead>
                <TableHead className="hidden md:table-cell">Кол-во гостей</TableHead>
                <TableHead>Дата и время</TableHead>
                <TableHead className="hidden md:table-cell">Стоимость</TableHead>
                <TableHead className="hidden lg:table-cell">Предоплата</TableHead>
                {isAdmin && <TableHead className="text-right">Действия</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const zone = getZoneById(booking.zoneId);
                  return (
                    <TableRow 
                      key={booking.id} 
                      className="transition-colors cursor-pointer" 
                      onClick={() => handleRowClick(booking)}
                    >
                      <TableCell className="font-medium">{zone?.name}</TableCell>
                      <TableCell>{booking.clientName}</TableCell>
                      <TableCell className="hidden md:table-cell">{booking.phoneNumber}</TableCell>
                      <TableCell className="hidden md:table-cell">{booking.personCount}</TableCell>
                      <TableCell>{formatDate(booking.dateTime)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatMoney(booking.rentalCost)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{formatMoney(booking.prepayment)}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(booking)}>
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(booking.id)}>
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center h-24">
                    Нет доступных бронирований
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={selectedBooking !== null} onOpenChange={closeDetails}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Детали бронирования</DialogTitle>
            <DialogDescription>
              Подробная информация о выбранном бронировании
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Зона</h3>
                  <p className="text-lg">{getZoneById(selectedBooking.zoneId)?.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Тип зоны</h3>
                  <p className="text-lg">{getZoneById(selectedBooking.zoneId)?.type}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Клиент</h3>
                  <p className="text-lg">{selectedBooking.clientName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Телефон</h3>
                  <p className="text-lg">{selectedBooking.phoneNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Дата и время</h3>
                  <p className="text-lg">{formatDate(selectedBooking.dateTime)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Количество гостей</h3>
                  <p className="text-lg">{selectedBooking.personCount}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Стоимость</h3>
                  <p className="text-lg">{formatMoney(selectedBooking.rentalCost)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Предоплата</h3>
                  <p className="text-lg">{formatMoney(selectedBooking.prepayment)}</p>
                </div>
              </div>
              
              {selectedBooking.menu && (
                <div>
                  <h3 className="font-medium text-muted-foreground">Меню</h3>
                  <p className="text-lg whitespace-pre-line">{selectedBooking.menu}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Создано</h3>
                  <p className="text-sm">{formatDate(selectedBooking.createdAt)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Обновлено</h3>
                  <p className="text-sm">{formatDate(selectedBooking.updatedAt)}</p>
                </div>
              </div>
              
              {isAdmin && (
                <div className="flex justify-end space-x-4 mt-4">
                  <Button variant="outline" onClick={() => {
                    closeDetails();
                    handleEdit(selectedBooking);
                  }}>
                    <EditIcon className="mr-2 h-4 w-4" />
                    Редактировать
                  </Button>
                  <Button variant="destructive" onClick={() => {
                    closeDetails();
                    handleDelete(selectedBooking.id);
                  }}>
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Удалить
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingTable;
