
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Search, Download, Users, Edit } from 'lucide-react';
import { Customer } from '@/lib/types';

const CustomersDatabase = () => {
  const customers = useStore((state) => state.customers);
  const updateCustomerNotes = useStore((state) => state.updateCustomerNotes);
  const exportCustomersToExcel = useStore((state) => state.exportCustomersToExcel);
  const currentUser = useStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phoneNumber.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNotes(customer.notes || '');
  };

  const handleCloseDetails = () => {
    setSelectedCustomer(null);
    setNotes('');
  };

  const handleSaveNotes = async () => {
    if (selectedCustomer) {
      await updateCustomerNotes(selectedCustomer.phoneNumber, notes);
      handleCloseDetails();
    }
  };

  const handleExportToExcel = () => {
    exportCustomersToExcel();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или номеру телефона..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={handleExportToExcel}
          className="w-full sm:w-auto flex gap-2 items-center"
        >
          <Download className="h-4 w-4" />
          <span>Экспорт в Excel</span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>База клиентов ({filteredCustomers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="py-3 px-4 text-left font-medium">Имя клиента</th>
                  <th className="py-3 px-4 text-left font-medium">Номер телефона</th>
                  <th className="py-3 px-4 text-left font-medium">Бронирований</th>
                  <th className="py-3 px-4 text-left font-medium">Последнее посещение</th>
                  <th className="py-3 px-4 text-left font-medium">Примечания</th>
                  <th className="py-3 px-4 text-right font-medium sr-only">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.phoneNumber}
                      className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetails(customer)}
                    >
                      <td className="py-3 px-4">{customer.name}</td>
                      <td className="py-3 px-4">{customer.phoneNumber}</td>
                      <td className="py-3 px-4">{customer.bookingsCount}</td>
                      <td className="py-3 px-4">
                        {format(new Date(customer.lastBooking), 'dd MMMM yyyy', { locale: ru })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate">
                          {customer.notes || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Редактировать</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      {searchTerm
                        ? 'Клиенты не найдены по вашему запросу'
                        : 'Нет данных о клиентах'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedCustomer !== null} onOpenChange={handleCloseDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Информация о клиенте</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Имя клиента</Label>
                  <div className="font-medium mt-1">{selectedCustomer.name}</div>
                </div>
                <div>
                  <Label>Номер телефона</Label>
                  <div className="font-medium mt-1">{selectedCustomer.phoneNumber}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Количество бронирований</Label>
                  <div className="font-medium mt-1">{selectedCustomer.bookingsCount}</div>
                </div>
                <div>
                  <Label>Последнее бронирование</Label>
                  <div className="font-medium mt-1">
                    {format(new Date(selectedCustomer.lastBooking), 'dd.MM.yyyy HH:mm', { locale: ru })}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Примечания</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Введите примечание о клиенте..."
                  rows={4}
                  className="mt-1"
                  disabled={!isAdmin}
                />
                {!isAdmin && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Только администратор может редактировать примечания.
                  </p>
                )}
              </div>

              {isAdmin && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotes}>Сохранить примечание</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersDatabase;
