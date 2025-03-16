
import React from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ru } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { Booking } from '@/lib/types';

const BookingCalendar = () => {
  const selectedDate = useStore((state) => state.selectedDate);
  const setSelectedDate = useStore((state) => state.setSelectedDate);
  const getFilteredBookings = useStore((state) => state.getFilteredBookings);
  const getZoneById = useStore((state) => state.getZoneById);
  const bookings = useStore((state) => state.bookings);

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
    const date = parseISO(dateTime);
    return format(date, 'HH:mm');
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(amount);
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
                    className="p-4 rounded-lg border border-border bg-card/50 transition-all hover:shadow-md animate-slide-in"
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
    </div>
  );
};

export default BookingCalendar;
