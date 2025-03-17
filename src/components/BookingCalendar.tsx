
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ru } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { format, isToday, parseISO, addHours } from 'date-fns';
import { Booking } from '@/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EditIcon, Trash2Icon } from 'lucide-react';

// Часовой пояс Алматы GMT+5
const TIMEZONE_OFFSET = 5;

const BookingCalendar = () => {
  const selectedDate = useStore((state) => state.selectedDate);
  const setSelectedDate = useStore((state) => state.setSelectedDate);
  const getZoneById = useStore((state) => state.getZoneById);
  const bookings = useStore((state) => state.bookings);
  const editBooking = useStore((state) => state.editBooking);
  const deleteBooking = useStore((state) => state.deleteBooking);
  const currentUser = useStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === 'admin';
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const getBookingsForDate = () => {
    return bookings.filter(
      (booking) => booking.dateTime.split('T')[0] === selectedDate
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date.toISOString().split('T')[0]);
    }
  };

  const getBookingDates = () => {
    const dates = new Set<string>();
    bookings.forEach((booking) => {
      dates.add(booking.dateTime.split('T')[0]);
    });
    return Array.from(dates).map((date) => new Date(date));
  };

  const getTodayBookingCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter((booking) => booking.dateTime.split('T')[0] === today).length;
  };

  const formatDateTime = (dateTime: string) => {
    // Применяем часовой пояс Алматы GMT+5
    const date = parseISO(dateTime);
    const dateWithTZ = addHours(date, TIMEZONE_OFFSET);
    return format(dateWithTZ, 'HH:mm');
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateTime: string) => {
    // Применяем часовой пояс Алматы GMT+5
    const date = parseISO(dateTime);
    const dateWithTZ = addHours(date, TIMEZONE_OFFSET);
    return format(dateWithTZ, 'dd.MM.yyyy HH:mm', { locale: ru });
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const closeDetails = () => {
    setSelectedBooking(null);
  };

  const handleEdit = (booking: Booking) => {
    editBooking(booking);
    closeDetails();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это бронирование?')) {
      deleteBooking(id);
      closeDetails();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Календарь бронирований
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate ? new Date(selectedDate) : undefined}
            onSelect={handleDateSelect}
            locale={ru}
            className="rounded-md border p-3 pointer-events-auto"
            modifiers={{
              booked: getBookingDates(),
            }}
            modifiersStyles={{
              booked: {
                fontWeight: 'bold',
                backgroundColor: 'hsl(var(--primary) / 0.2)',
                color: 'hsl(var(--primary))',
              },
            }}
          />
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-primary/20"></div>
              <span>Есть бронирования</span>
            </div>
            <p className="mt-2">
              {isToday(new Date(selectedDate))
                ? `Сегодня: ${getTodayBookingCount()} бронирований`
                : `Выбрано: ${format(new Date(selectedDate), 'd MMMM yyyy', { locale: ru })}`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>
            Бронирования на {format(new Date(selectedDate), 'd MMMM yyyy', { locale: ru })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {getBookingsForDate().length > 0 ? (
              getBookingsForDate().map((booking) => {
                const zone = getZoneById(booking.zoneId);
                return (
                  <div
                    key={booking.id}
                    className="p-4 rounded-lg border border-border bg-card/50 transition-all hover:shadow-md animate-slide-in cursor-pointer"
                    onClick={() => handleBookingClick(booking)}
                  >
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">{zone?.name}</div>
                      <div className="text-sm text-primary font-semibold">
                        {formatDateTime(booking.dateTime)}
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Клиент:</span>
                        <span>{booking.clientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Гости:</span>
                        <span>{booking.personCount} чел.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Стоимость:</span>
                        <span>{formatMoney(booking.rentalCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Предоплата:</span>
                        <span>{formatMoney(booking.prepayment)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Нет бронирований на эту дату
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                  <Button variant="outline" onClick={() => handleEdit(selectedBooking)}>
                    <EditIcon className="mr-2 h-4 w-4" />
                    Редактировать
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(selectedBooking.id)}>
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

export default BookingCalendar;
