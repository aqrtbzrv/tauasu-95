import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Booking, Zone } from '@/lib/types';
import { toast } from 'sonner';
import { addHours, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Users, 
  Calendar, 
  Home, 
  Phone, 
  DollarSign, 
  Clock, 
  UtensilsCrossed 
} from 'lucide-react';

const TIMEZONE_OFFSET = 6;

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingForm = ({ isOpen, onClose }: BookingFormProps) => {
  const {
    zones,
    addBooking,
    updateBooking,
    isEditingBooking,
    currentBooking,
    editBooking,
    selectedDate,
    isZoneBooked,
  } = useStore();
  
  const [formData, setFormData] = useState<Partial<Booking>>({
    zoneId: '',
    clientName: '',
    rentalCost: 0,
    prepayment: 0,
    personCount: 1,
    dateTime: `${selectedDate}T12:00`,
    menu: '',
    phoneNumber: '',
  });

  const [availableZones, setAvailableZones] = useState<Zone[]>([]);
  const [activeTab, setActiveTab] = useState('zone');

  useEffect(() => {
    if (isEditingBooking && currentBooking) {
      setFormData({
        ...currentBooking,
      });
      setActiveTab('zone');
    } else {
      const now = new Date();
      const nowWithTimezone = addHours(now, TIMEZONE_OFFSET);
      const formattedDate = format(nowWithTimezone, "yyyy-MM-dd'T'HH:mm");

      setFormData({
        zoneId: '',
        clientName: '',
        rentalCost: 0,
        prepayment: 0,
        personCount: 1,
        dateTime: formattedDate,
        menu: '',
        phoneNumber: '',
      });
      setActiveTab('zone');
    }
  }, [isEditingBooking, currentBooking, selectedDate]);

  useEffect(() => {
    const date = formData.dateTime?.split('T')[0] || selectedDate;
    
    const filtered = zones.filter((zone) => {
      if (isEditingBooking && currentBooking && currentBooking.zoneId === zone.id) {
        return true;
      }
      
      return !isZoneBooked(zone.id, `${date}T00:00`);
    });
    
    setAvailableZones(filtered);
  }, [formData.dateTime, selectedDate, zones, isZoneBooked, isEditingBooking, currentBooking]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: Number(value) });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
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
    
    if (isEditingBooking && currentBooking) {
      updateBooking(currentBooking.id, formData);
    } else {
      const bookingData = {
        ...formData,
      } as Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>;
      
      addBooking(bookingData);
    }
    
    onClose();
  };

  const handleCancel = () => {
    editBooking(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditingBooking ? 'Редактировать бронирование' : 'Новое бронирование'}
          </DialogTitle>
        </DialogHeader>
        
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
                
                <Select
                  value={formData.zoneId}
                  onValueChange={(value) => handleSelectChange('zoneId', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Выберите зону" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableZones.length > 0 ? (
                      availableZones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name} ({zone.type})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-muted-foreground">
                        Нет доступных зон на выбранную дату
                      </div>
                    )}
                  </SelectContent>
                </Select>
                
                {formData.zoneId && (
                  <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900">
                    <h3 className="font-medium mb-2 text-green-800 dark:text-green-300">
                      Выбранная зона:
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      <strong>{zones.find(z => z.id === formData.zoneId)?.name}</strong> 
                      {' '}({zones.find(z => z.id === formData.zoneId)?.type})
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Отмена
                </Button>
                <Button onClick={moveToNextTab}>
                  Далее
                </Button>
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
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Введите имя клиента"
                  className="h-12"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-base font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>Номер телефона</span>
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+7 (XXX) XXX-XX-XX"
                  className="h-12"
                  required
                />
              </div>
              
              <div className="flex justify-between gap-2 pt-4">
                <Button type="button" variant="outline" onClick={moveToPrevTab}>
                  Назад
                </Button>
                <Button onClick={moveToNextTab}>
                  Далее
                </Button>
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
                    value={formData.rentalCost}
                    onChange={handleNumberChange}
                    min={0}
                    className="h-12"
                    required
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
                    value={formData.prepayment}
                    onChange={handleNumberChange}
                    min={0}
                    className="h-12"
                    required
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
                    value={formData.personCount}
                    onChange={handleNumberChange}
                    min={1}
                    className="h-12"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateTime" className="text-base font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>Дата и время</span>
                  </Label>
                  <Input
                    id="dateTime"
                    name="dateTime"
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={handleChange}
                    className="h-12"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="menu" className="text-base font-medium flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-green-600" />
                  <span>Меню (опционально)</span>
                </Label>
                <Textarea
                  id="menu"
                  name="menu"
                  value={formData.menu || ''}
                  onChange={handleChange}
                  placeholder="Описание заказанных блюд"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-between gap-2 pt-4">
                <Button type="button" variant="outline" onClick={moveToPrevTab}>
                  Назад
                </Button>
                <Button onClick={handleSubmit}>
                  {isEditingBooking ? 'Сохранить' : 'Добавить бронирование'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;
