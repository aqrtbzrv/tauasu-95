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
import { Booking, Zone } from '@/lib/types';
import { toast } from 'sonner';

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

  // Initialize form when editing a booking
  useEffect(() => {
    if (isEditingBooking && currentBooking) {
      setFormData({
        ...currentBooking,
      });
    } else {
      // Reset form for new booking
      setFormData({
        zoneId: '',
        clientName: '',
        rentalCost: 0,
        prepayment: 0,
        personCount: 1,
        dateTime: `${selectedDate}T12:00`,
        menu: '',
        phoneNumber: '',
      });
    }
  }, [isEditingBooking, currentBooking, selectedDate]);

  // Update available zones based on selected date and time
  useEffect(() => {
    const date = formData.dateTime?.split('T')[0] || selectedDate;
    
    // Filter out zones that are already booked for this date
    const filtered = zones.filter((zone) => {
      // If we're editing a booking, don't consider the current booking as a conflict
      if (isEditingBooking && currentBooking && currentBooking.zoneId === zone.id) {
        return true;
      }
      
      // Check if zone is booked on the selected date
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.zoneId) {
      toast.error('Выберите зону');
      return;
    }
    
    if (!formData.clientName) {
      toast.error('Введите имя клиента');
      return;
    }
    
    if (!formData.phoneNumber) {
      toast.error('Введите номер телефона');
      return;
    }
    
    if (!formData.dateTime) {
      toast.error('Выберите дату и время');
      return;
    }
    
    // If editing, update the booking
    if (isEditingBooking && currentBooking) {
      updateBooking(currentBooking.id, formData);
    } else {
      // Otherwise add a new booking
      addBooking(formData as Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>);
    }
    
    onClose();
  };

  const handleCancel = () => {
    editBooking(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditingBooking ? 'Редактировать бронирование' : 'Новое бронирование'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zoneId">Зона</Label>
            <Select
              value={formData.zoneId}
              onValueChange={(value) => handleSelectChange('zoneId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите зону" />
              </SelectTrigger>
              <SelectContent>
                {availableZones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name} ({zone.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientName">Имя клиента</Label>
            <Input
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="Введите имя клиента"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Номер телефона</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+7 (XXX) XXX-XX-XX"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rentalCost">Стоимость аренды</Label>
              <Input
                id="rentalCost"
                name="rentalCost"
                type="number"
                value={formData.rentalCost}
                onChange={handleNumberChange}
                min={0}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prepayment">Предоплата</Label>
              <Input
                id="prepayment"
                name="prepayment"
                type="number"
                value={formData.prepayment}
                onChange={handleNumberChange}
                min={0}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="personCount">Количество гостей</Label>
              <Input
                id="personCount"
                name="personCount"
                type="number"
                value={formData.personCount}
                onChange={handleNumberChange}
                min={1}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateTime">Дата и время</Label>
              <Input
                id="dateTime"
                name="dateTime"
                type="datetime-local"
                value={formData.dateTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="menu">Меню (опционально)</Label>
            <Textarea
              id="menu"
              name="menu"
              value={formData.menu || ''}
              onChange={handleChange}
              placeholder="Описание заказанных блюд"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Отмена
            </Button>
            <Button type="submit">
              {isEditingBooking ? 'Сохранить' : 'Добавить бронирование'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;
