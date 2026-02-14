'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  room: {
    name: string;
  };
  user: {
    fullName: string;
  };
}

interface Room {
  id: string;
  name: string;
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch rooms
        const roomsRes = await fetch('/api/rooms?isActive=true', {
          credentials: 'include',
        });
        if (roomsRes.ok) {
          const data = await roomsRes.json();
          setRooms(data);
        }

        // Fetch bookings for the month
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        let url = `/api/bookings?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        if (selectedRoom !== 'all') {
          url += `&roomId=${selectedRoom}`;
        }

        const bookingsRes = await fetch(url, {
          credentials: 'include',
        });
        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [year, month, selectedRoom]);

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getBookingsForDay = (day: number) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.date.startsWith(dateStr));
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('th-TH', {
    month: 'long',
    year: 'numeric',
  });

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const selectedDayBookings = selectedDay ? getBookingsForDay(selectedDay) : [];
  const selectedDateLabel = selectedDay
    ? new Date(year, month, selectedDay).toLocaleDateString('th-TH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const statusConfig: Record<string, { label: string; className: string }> = {
    APPROVED: { label: 'อนุมัติแล้ว', className: 'bg-green-500/15 text-green-700 dark:text-green-400' },
    PENDING: { label: 'รอการอนุมัติ', className: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400' },
    REJECTED: { label: 'ปฏิเสธ', className: 'bg-red-500/15 text-red-700 dark:text-red-400' },
    CANCELLED: { label: 'ยกเลิกแล้ว', className: 'bg-muted text-muted-foreground' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('calendar.title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">All Rooms</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id} className="rounded-lg">
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-accent/30">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="rounded-xl h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth} className="rounded-xl h-9 w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="rounded-xl">
              Today
            </Button>
          </div>
          <CardTitle className="text-lg">{monthName}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {/* Week day headers */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center py-3 text-sm font-semibold text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((day, index) => {
                const dayBookings = day ? getBookingsForDay(day).filter(b => b.status !== 'CANCELLED') : [];
                const isToday = isCurrentMonth && day === today.getDate();

                return (
                  <div
                    key={index}
                    onClick={() => day && setSelectedDay(day)}
                    className={`min-h-24 p-1.5 border rounded-xl transition-colors ${
                      day ? 'bg-card hover:bg-accent/30 cursor-pointer' : 'bg-muted/30'
                    } ${isToday ? 'ring-2 ring-primary ring-offset-2' : 'border-border/50'}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-semibold mb-1.5 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayBookings.slice(0, 3).map((booking) => (
                            <div
                              key={booking.id}
                              className={`text-xs px-1.5 py-1 rounded-md truncate font-medium ${
                                booking.status === 'APPROVED'
                                  ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                                  : booking.status === 'PENDING'
                                  ? 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                              title={`${booking.room.name} - ${booking.purpose}`}
                            >
                              {formatTime(booking.startTime)} {booking.room.name}
                            </div>
                          ))}
                          {dayBookings.length > 3 && (
                            <div className="text-xs text-primary font-medium pl-1">
                              +{dayBookings.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base">{selectedDateLabel}</DialogTitle>
          </DialogHeader>

          {selectedDayBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <p className="text-sm">ไม่มีการจองในวันนี้</p>
            </div>
          ) : (
            <div className="overflow-y-auto space-y-3 pr-1">
              {selectedDayBookings.map((booking) => {
                const status = statusConfig[booking.status] ?? { label: booking.status, className: 'bg-muted text-muted-foreground' };
                return (
                  <div key={booking.id} className="border border-border/60 rounded-xl p-4 space-y-2 bg-card">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm leading-snug">{booking.purpose}</p>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="opacity-60">🏢</span>
                        <span>{booking.room.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="opacity-60">👤</span>
                        <span>{booking.user.fullName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <span className="opacity-60">🕐</span>
                        <span>{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
