
import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Booking, Zone } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Users, Calendar, Home, Phone, DollarSign, Clock, UtensilsCrossed, Lock } from 'lucide-react';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingForm = ({
  isOpen,
  onClose
}: BookingFormProps) => {
  const {
    zones,
    addBooking,
    updateBooking,
    isEditingBooking,
    currentBooking,
    editBooking,
    selectedDate,
    isZoneBooked,
    currentUser,
    closeBooking
  } = useStore();
  const isAdmin = currentUser?.role === 'admin';
  const [formData, setFormData] = useState<Partial<Booking & { endTime: string }>>({
    zoneId: '',
    clientName: '',
    rentalCost: null,
    prepayment: null,
    personCount: 1,
    dateTime: `${selectedDate}T12:00`,
    endTime: `${selectedDate}T14:00`,
    menu: '',
    phoneNumber: ''
  });
  const [availableZones, setAvailableZones] = useState<Zone[]>([]);
  const [activeTab, setActiveTab] = useState('zone');
  const [timeOptions, setTimeOptions] = useState<string[]>([]);
  const [customZoneName, setCustomZoneName] = useState('');

  useEffect(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      options.push(`${hour.toString().padStart(2, '0')}:00`);
      options.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    setTimeOptions(options);
  }, []);

  useEffect(() => {
    if (isEditingBooking && currentBooking) {
      const bookingDateTime = new Date(currentBooking.dateTime);
      const bookingTime = format(bookingDateTime, 'HH:mm');
      
      const endDateTime = new Date(bookingDateTime);
      endDateTime.setHours(endDateTime.getHours() + 2);
      const endTime = format(endDateTime, 'HH:mm');
      
      const zone = zones.find(z => z.id === currentBooking.zoneId);
      if (zone && zone.type === 'Другое') {
        setCustomZoneName(zone.name);
      }
      
      setFormData({
        ...currentBooking,
        endTime: `${currentBooking.dateTime.split('T')[0]}T${endTime}`
      });
      setActiveTab('zone');
    } else {
      const now = new Date();
      const formattedDate = format(now, "yyyy-MM-dd");
      setFormData({
        zoneId: '',
        clientName: '',
        rentalCost: null,
        prepayment: null,
        personCount: 1,
        dateTime: `${formattedDate}T12:00`,
        endTime: `${formattedDate}T14:00`,
        menu: '',
        phoneNumber: ''
      });
      setCustomZoneName('');
      setActiveTab('zone');
    }
  }, [isEditingBooking, currentBooking, selectedDate]);

  useEffect(() => {
    const date = formData.dateTime?.split('T')[0] || selectedDate;
    const filtered = zones.filter(zone => {
      if (isEditingBooking && currentBooking && currentBooking.zoneId === zone.id) {
        return true;
      }
      return !isZoneBooked(zone.id, `${date}T00:00`);
    });
    setAvailableZones(filtered);
  }, [formData.dateTime, selectedDate, zones, isZoneBooked, isEditingBooking, currentBooking]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value === '' ? null : Number(value)
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTimeChange = (type: 'start' | 'end', time: string) => {
    const datePart = formData.dateTime?.split('T')[0] || selectedDate;
    if (type === 'start') {
      setFormData({
        ...formData,
        dateTime: `${datePart}T${time.replace(':', ':')}:00`
      });
      
      const startHour = parseInt(time.split(':')[0], 10);
      const startMinute = parseInt(time.split(':')[1], 10);
      const endTime = formData.endTime?.split('T')[1].split(':') || [];
      const endHour = parseInt(endTime[0] || '0', 10);
      const endMinute = parseInt(endTime[1] || '0', 10);
      
      if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
        let newEndHour = startHour + 2;
        if (newEndHour >= 24) {
          newEndHour = 23;
          setFormData(prev => ({
            ...prev,
            endTime: `${datePart}T${newEndHour.toString().padStart(2, '0')}:30:00`
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            endTime: `${datePart}T${newEndHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`
          }));
        }
      }
    } else {
      setFormData({
        ...formData,
        endTime: `${datePart}T${time.replace(':', ':')}:00`
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const startTime = formData.dateTime?.split('T')[1] || '12:00:00';
    const endTime = formData.endTime?.split('T')[1] || '14:00:00';
    
    setFormData({
      ...formData,
      dateTime: `${newDate}T${startTime}`,
      endTime: `${newDate}T${endTime}`
    });
  };

  const handleCustomZoneNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomZoneName(e.target.value);
  };

  const moveToNextTab = () => {
    switch (activeTab) {
      case 'zone':
        if (!formData.zoneId) {
          toast.error('Выберите зону');
          return;
        }
        setActiveTab('client');
        break;
      case 'client':
        if (!formData.clientName) {
          toast.error('Введите имя клиента');
          return;
        }
        if (!formData.phoneNumber) {
          toast.error('Введите номер телефона');
          return;
        }
        setActiveTab('details');
        break;
      case 'details':
        handleSubmit();
        break;
    }
  };

  const moveToPrevTab = () => {
    switch (activeTab) {
      case 'client':
        setActiveTab('zone');
        break;
      case 'details':
        setActiveTab('client');
        break;
    }
  };

  const handleSubmit = () => {
    if (!formData.zoneId) {
      toast.error('Выберите зону');
      setActiveTab('zone');
      return;
    }
    
    let finalZoneId = formData.zoneId;
    if (formData.zoneId === 'other' && customZoneName) {
      finalZoneId = `other-${new Date().getTime()}`;
      
      const customZone: Zone = {
        id: finalZoneId,
        name: customZoneName,
        type: 'Другое'
      };
      
      useStore.getState().zones.push(customZone);
    } else if (formData.zoneId === 'other' && !customZoneName) {
      toast.error('Введите название зоны');
      return;
    }
    
    if (!formData.clientName) {
      toast.error('Введите имя клиента');
      setActiveTab('client');
      return;
    }
    if (!formData.phoneNumber) {
      toast.error('Введите номер телефона');
      setActiveTab('client');
      return;
    }
    if (!formData.dateTime) {
      toast.error('Выберите дату и время');
      setActiveTab('details');
      return;
    }
    
    const startDateTime = new Date(formData.dateTime);
    const endDateTime = new Date(formData.endTime || '');
    
    if (startDateTime >= endDateTime) {
      toast.error('Время начала должно быть раньше времени окончания');
      return;
    }
    
    const bookingData = {
      ...formData,
      zoneId: finalZoneId,
      rentalCost: formData.rentalCost || 0,
      prepayment: formData.prepayment || 0,
      personCount: formData.personCount || 1
    };
    
    const { endTime, ...bookingDataWithoutEndTime } = bookingData;
    
    if (isEditingBooking && currentBooking) {
      updateBooking(currentBooking.id, bookingDataWithoutEndTime);
    } else {
      addBooking(bookingDataWithoutEndTime as Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'waiterViewed' | 'cookViewed' | 'waiterViewedAt' | 'cookViewedAt' | 'closed' | 'closedBy' | 'closedAt'>);
    }
    onClose();
  };

  const handleCancel = () => {
    editBooking(null);
    onClose();
  };

  const handleCloseBooking = () => {
    if (currentBooking && !currentBooking.closed) {
      closeBooking(currentBooking.id);
      onClose();
    }
  };

  const isDisabled = !isAdmin;
  const isBookingClosed = currentBooking?.closed || false;

  if (!isAdmin && !isEditingBooking) {
    return null;
  }

  const getTimeFromISOString = (isoString?: string) => {
    if (!isoString) return '';
    return isoString.split('T')[1].substring(0, 5);
  };

  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] w-[calc(100%-2rem)] mx-auto max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditingBooking ? 'Детали бронирования' : 'Новое бронирование'}
          </DialogTitle>
        </DialogHeader>
        
        {isBookingClosed && (
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-500" />
            <div>
              <div className="font-medium">Бронирование закрыто</div>
              {currentBooking?.closedBy && currentBooking?.closedAt && (
                <div className="text-sm text-gray-500">
                  Пользователем {currentBooking.closedBy} {format(new Date(currentBooking.closedAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                </div>
              )}
            </div>
          </div>
        )}
        
        {currentBooking?.createdBy && currentBooking?.createdAt && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="text-sm text-gray-500">
              Создано пользователем {currentBooking.createdBy} {format(new Date(currentBooking.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
            </div>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="zone" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Выбор зоны</span>
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Клиент</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Детали</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="zone">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="zoneId" className="text-base font-medium flex items-center gap-2">
                  <Home className="h-4 w-4 text-green-600" />
                  <span>Выберите зону</span>
                </Label>
                
                <Select value={formData.zoneId} onValueChange={value => handleSelectChange('zoneId', value)} disabled={isDisabled || isBookingClosed}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Выберите зону" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableZones.length > 0 ? availableZones.map(zone => <SelectItem key={zone.id} value={zone.id}>
                          {zone.name} ({zone.type})
                        </SelectItem>) : <div className="p-2 text-center text-muted-foreground">
                        Нет доступных зон на выбранную дату
                      </div>}
                  </SelectContent>
                </Select>
                
                {formData.zoneId === 'other' && (
                  <div className="mt-4">
                    <Label htmlFor="customZoneName" className="text-base font-medium">
                      Введите название зоны
                    </Label>
                    <Input 
                      id="customZoneName" 
                      name="customZoneName" 
                      value={customZoneName} 
                      onChange={handleCustomZoneNameChange} 
                      placeholder="Введите название зоны" 
                      className="h-12 mt-2" 
                      required 
                      disabled={isDisabled || isBookingClosed} 
                    />
                  </div>
                )}
                
                {formData.zoneId && formData.zoneId !== 'other' && <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900">
                    <h3 className="font-medium mb-2 text-green-800 dark:text-green-300">
                      Выбранная зона:
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      <strong>{zones.find(z => z.id === formData.zoneId)?.name}</strong> 
                      {' '}({zones.find(z => z.id === formData.zoneId)?.type})
                    </p>
                  </div>}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Отмена
                </Button>
                {!isDisabled && !isBookingClosed && <Button onClick={moveToNextTab}>
                    Далее
                  </Button>}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="client">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-base font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>Имя клиента</span>
                </Label>
                <Input id="clientName" name="clientName" value={formData.clientName} onChange={handleChange} placeholder="Введите имя клиента" className="h-12" required disabled={isDisabled || isBookingClosed} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-base font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>Номер телефона</span>
                </Label>
                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+7 (XXX) XXX-XX-XX" className="h-12" required disabled={isDisabled || isBookingClosed} />
              </div>
              
              <div className="flex justify-between gap-2 pt-4">
                <Button type="button" variant="outline" onClick={moveToPrevTab}>
                  Назад
                </Button>
                {!isDisabled && !isBookingClosed && <Button onClick={moveToNextTab}>
                    Далее
                  </Button>}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rentalCost" className="text-base font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>Стоимость аренды</span>
                  </Label>
                  <Input 
                    id="rentalCost" 
                    name="rentalCost" 
                    type="number" 
                    value={formData.rentalCost === null ? '' : formData.rentalCost} 
                    onChange={handleNumberChange} 
                    min={0} 
                    className="h-12" 
                    placeholder="Введите стоимость"
                    required 
                    disabled={isDisabled || isBookingClosed} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prepayment" className="text-base font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>Предоплата</span>
                  </Label>
                  <Input 
                    id="prepayment" 
                    name="prepayment" 
                    type="number" 
                    value={formData.prepayment === null ? '' : formData.prepayment} 
                    onChange={handleNumberChange} 
                    min={0} 
                    className="h-12" 
                    placeholder="Введите предоплату"
                    required 
                    disabled={isDisabled || isBookingClosed} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personCount" className="text-base font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span>Количество гостей</span>
                  </Label>
                  <Input 
                    id="personCount" 
                    name="personCount" 
                    type="number" 
                    value={formData.personCount === null ? '' : formData.personCount} 
                    onChange={handleNumberChange} 
                    min={1} 
                    className="h-12" 
                    placeholder="Введите количество"
                    required 
                    disabled={isDisabled || isBookingClosed} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bookingDate" className="text-base font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span>Дата бронирования</span>
                  </Label>
                  <Input 
                    id="bookingDate" 
                    type="date" 
                    value={formData.dateTime?.split('T')[0]} 
                    onChange={handleDateChange} 
                    className="h-12" 
                    required 
                    disabled={isDisabled || isBookingClosed} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-base font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>Время начала</span>
                  </Label>
                  <Select 
                    value={getTimeFromISOString(formData.dateTime)} 
                    onValueChange={(value) => handleTimeChange('start', value)}
                    disabled={isDisabled || isBookingClosed}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Выберите время" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={`start-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-base font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>Время окончания</span>
                  </Label>
                  <Select 
                    value={getTimeFromISOString(formData.endTime)} 
                    onValueChange={(value) => handleTimeChange('end', value)}
                    disabled={isDisabled || isBookingClosed}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Выберите время" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={`end-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="menu" className="text-base font-medium flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-green-600" />
                  <span>Меню (опционально)</span>
                </Label>
                <Textarea id="menu" name="menu" value={formData.menu || ''} onChange={handleChange} placeholder="Описание заказанных блюд" rows={3} disabled={isDisabled || isBookingClosed} />
              </div>
              
              <div className="flex justify-between gap-2 pt-4">
                <Button type="button" variant="outline" onClick={moveToPrevTab}>
                  Назад
                </Button>
                <div className="flex gap-2">
                  {isEditingBooking && !isBookingClosed && !isDisabled && (
                    <Button 
                      variant="destructive" 
                      onClick={handleCloseBooking}
                      className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Закрыть бронь
                    </Button>
                  )}
                  {!isDisabled && !isBookingClosed && <Button onClick={handleSubmit}>
                      {isEditingBooking ? 'Сохранить' : 'Добавить бронирование'}
                    </Button>}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>;
};

export default BookingForm;
