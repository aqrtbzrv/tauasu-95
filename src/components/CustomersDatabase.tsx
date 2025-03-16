
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Search, Edit2, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Customer } from '@/lib/types';

const CustomersDatabase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  
  const getCustomers = useStore((state) => state.getCustomers);
  const updateCustomerNotes = useStore((state) => state.updateCustomerNotes);
  const currentUser = useStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === 'admin';
  
  const customers = getCustomers();
  
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phoneNumber.includes(searchQuery)
    );
  });
  
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd.MM.yyyy', { locale: ru });
    } catch (e) {
      return 'Нет данных';
    }
  };
  
  const handleEditNote = (customer: Customer) => {
    setEditingNote(customer.phoneNumber);
    setNoteText(customer.notes || '');
  };
  
  const handleSaveNote = async (phoneNumber: string) => {
    await updateCustomerNotes(phoneNumber, noteText);
    setEditingNote(null);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>База данных клиентов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени или номеру телефона"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя клиента</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead className="hidden md:table-cell">Кол-во бронирований</TableHead>
                    <TableHead className="hidden md:table-cell">Последнее бронирование</TableHead>
                    <TableHead>Примечания</TableHead>
                    {isAdmin && <TableHead className="w-[100px]">Действия</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.phoneNumber}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phoneNumber}</TableCell>
                        <TableCell className="hidden md:table-cell">{customer.bookingsCount}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(customer.lastBooking)}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {editingNote === customer.phoneNumber ? (
                            <Textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Введите примечание о клиенте"
                              className="min-h-[80px]"
                            />
                          ) : (
                            <span className="line-clamp-2">{customer.notes || 'Нет примечаний'}</span>
                          )}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            {editingNote === customer.phoneNumber ? (
                              <Button 
                                size="sm" 
                                onClick={() => handleSaveNote(customer.phoneNumber)}
                                className="w-full"
                              >
                                <Save className="mr-2 h-4 w-4" />
                                Сохранить
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditNote(customer)}
                                className="w-full"
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Примечание
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 6 : 5} className="h-24 text-center">
                        Нет данных о клиентах
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersDatabase;
