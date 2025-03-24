
import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ru } from 'date-fns/locale';
import { CalendarIcon, PhoneIcon, XIcon, CheckCircle2Icon, EyeIcon, ClockIcon } from 'lucide-react';
import { format, isToday, parseISO, formatDistanceToNow } from 'date-fns';
import { Booking, adjustDisplayTime } from '@/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EditIcon, Trash2Icon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const BookingCalendar = () => {
  const selectedDate = useStore((state) => state.selectedDate);
  const setSelectedDate = useStore((state) => state.setSelectedDate);
  const getZoneById = useStore((state) => state.getZoneById);
  const bookings = useStore((state) => state.bookings);
  const editBooking = useStore((state) => state.editBooking);
  const deleteBooking = useStore((state) => state.deleteBooking);
  const markAsViewed = useStore((state) => state.markAsViewed);
  const currentUser = useStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === 'admin';
  const isWaiter = currentUser?.username === 'waiter';
  const isCook = currentUser?.username === 'cookcook';
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!selectedDate || selectedDate === 'all') {
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  }, [selectedDate, setSelectedDate]);

  const getBookingsForDate = () => {
    if (!selectedDate || selectedDate === 'all') return [];
    
    return bookings.filter(
      (booking) => booking.dateTime.split('T')[0] === selectedDate
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setSelectedDate(formattedDate);
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

  const formatDate = (dateTime: string) => {
    const date = adjustDisplayTime(dateTime);
    return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
  };

  const formatDateTime = (dateTime: string) => {
    const date = adjustDisplayTime(dateTime);
    return format(date, 'HH:mm');
  };

  const formatTimeAgo = (dateTime?: string) => {
    if (!dateTime) return '';
    return formatDistanceToNow(new Date(dateTime), { addSuffix: true, locale: ru });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(amount);
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

  const handleMarkAsViewed = async (id: string, role: 'waiter' | 'cook') => {
    await markAsViewed(id, role);
  };

  const openWhatsApp = (phoneNumber: string) => {
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Календарь бронирований
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate ? new Date(selectedDate) : undefined}
              onSelect={handleDateSelect}
              locale={ru}
              className="rounded-md border p-3 pointer-events-auto max-w-full"
              modifiers={{
                booked: getBookingDates(),
                selected: selectedDate ? [new Date(selectedDate)] : [],
              }}
              modifiersStyles={{
                booked: {
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary) / 0.2)',
                  color: 'hsl(var(--primary))',
                },
                selected: {
                  backgroundColor: '#ea384c',
                  color: 'white',
                  fontWeight: 'bold',
                },
              }}
            />
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-primary/20"></div>
                <span>Есть бронирования</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: '#ea384c' }}></div>
                <span>Выбранная дата</span>
              </div>
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
                      
                      <div className="flex justify-between items-center pt-2 border-t mt-2">
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant={booking.waiterViewed ? "outline" : "destructive"} className="flex items-center gap-1">
                                  {booking.waiterViewed ? <CheckCircle2Icon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}
                                  Официант
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {booking.waiterViewed 
                                  ? `Просмотрено ${formatTimeAgo(booking.waiterViewedAt)}` 
                                  : "Не просмотрено официантом"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant={booking.cookViewed ? "outline" : "destructive"} className="flex items-center gap-1">
                                  {booking.cookViewed ? <CheckCircle2Icon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}
                                  Повар
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {booking.cookViewed 
                                  ? `Просмотрено ${formatTimeAgo(booking.cookViewedAt)}` 
                                  : "Не просмотрено поваром"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
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

      <Dialog open={selectedBooking !== null} onOpenChange={closeDetails}>
        <DialogContent className={`sm:max-w-lg ${isMobile ? 'w-[95vw] max-h-[90vh] max-w-[95vw]' : 'max-h-[90vh]'} p-6 rounded-lg overflow-y-auto`}>
          <DialogHeader className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0" 
              onClick={closeDetails}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Закрыть</span>
            </Button>
            <DialogTitle>Детали бронирования</DialogTitle>
            <DialogDescription>
              Подробная информация о выбранном бронировании
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Зона</h3>
                  <p className="text-lg">{getZoneById(selectedBooking.zoneId)?.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Тип зоны</h3>
                  <p className="text-lg">{getZoneById(selectedBooking.zoneId)?.type}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Клиент</h3>
                  <p className="text-lg">{selectedBooking.clientName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Телефон</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-lg">{selectedBooking.phoneNumber}</p>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        openWhatsApp(selectedBooking.phoneNumber);
                      }}
                    >
                      <PhoneIcon className="h-4 w-4 text-green-500" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Дата и время</h3>
                  <p className="text-lg">{formatDate(selectedBooking.dateTime)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Количество гостей</h3>
                  <p className="text-lg">{selectedBooking.personCount}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="mt-2 border-t pt-4">
                <h3 className="font-medium text-muted-foreground mb-2">Статус просмотра</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium flex items-center gap-1.5">
                        {selectedBooking.waiterViewed 
                          ? <CheckCircle2Icon className="h-4 w-4 text-green-500" /> 
                          : <EyeIcon className="h-4 w-4 text-amber-500" />}
                        Официант
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedBooking.waiterViewed 
                          ? <span className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {formatTimeAgo(selectedBooking.waiterViewedAt)}
                            </span> 
                          : "Не просмотрено"}
                      </p>
                    </div>
                    
                    {isWaiter && !selectedBooking.waiterViewed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsViewed(selectedBooking.id, 'waiter');
                        }}
                      >
                        Отметить
                      </Button>
                    )}
                    
                    {isAdmin && !selectedBooking.waiterViewed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsViewed(selectedBooking.id, 'waiter');
                        }}
                      >
                        Отметить за официанта
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium flex items-center gap-1.5">
                        {selectedBooking.cookViewed 
                          ? <CheckCircle2Icon className="h-4 w-4 text-green-500" /> 
                          : <EyeIcon className="h-4 w-4 text-amber-500" />}
                        Повар
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedBooking.cookViewed 
                          ? <span className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {formatTimeAgo(selectedBooking.cookViewedAt)}
                            </span> 
                          : "Не просмотрено"}
                      </p>
                    </div>
                    
                    {isCook && !selectedBooking.cookViewed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsViewed(selectedBooking.id, 'cook');
                        }}
                      >
                        Отметить
                      </Button>
                    )}
                    
                    {isAdmin && !selectedBooking.cookViewed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsViewed(selectedBooking.id, 'cook');
                        }}
                      >
                        Отметить за повара
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
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
                <DialogFooter className="flex flex-wrap justify-end gap-4 mt-4">
                  <Button variant="outline" onClick={() => handleEdit(selectedBooking)}>
                    <EditIcon className="mr-2 h-4 w-4" />
                    Редактировать
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(selectedBooking.id)}>
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Удалить
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingCalendar;
