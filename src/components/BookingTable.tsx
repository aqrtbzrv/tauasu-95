
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EditIcon, FilterIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Booking } from '@/lib/types';

const BookingTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const getFilteredBookings = useStore((state) => state.getFilteredBookings);
  const getZoneById = useStore((state) => state.getZoneById);
  const editBooking = useStore((state) => state.editBooking);
  const deleteBooking = useStore((state) => state.deleteBooking);
  const currentUser = useStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === 'admin';
  
  const bookings = getFilteredBookings();
  
  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      booking.clientName.toLowerCase().includes(searchLower) ||
      booking.phoneNumber.includes(searchQuery) ||
      getZoneById(booking.zoneId)?.name.toLowerCase().includes(searchLower)
    );
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
                    <TableRow key={booking.id} className="transition-colors">
                      <TableCell className="font-medium">{zone?.name}</TableCell>
                      <TableCell>{booking.clientName}</TableCell>
                      <TableCell className="hidden md:table-cell">{booking.phoneNumber}</TableCell>
                      <TableCell className="hidden md:table-cell">{booking.personCount}</TableCell>
                      <TableCell>{formatDate(booking.dateTime)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatMoney(booking.rentalCost)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{formatMoney(booking.prepayment)}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
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
    </div>
  );
};

export default BookingTable;
