'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, MapPin, Plus, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Room {
  id: string;
  name: string;
  building?: string;
  floor?: number;
  capacity: number;
}

interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface RecurringBooking {
  id: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  room: Room;
  semester?: Semester | null;
  createdAt: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function RecurringBookingsPage() {
  const { t } = useTranslation();
  const [recurringBookings, setRecurringBookings] = useState<RecurringBooking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    roomId: '',
    semesterId: '',
    daysOfWeek: [] as number[],
    startTime: '',
    endTime: '',
    purpose: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, roomsRes, semestersRes] = await Promise.all([
        fetch('/api/recurring-bookings/my', { credentials: 'include' }),
        fetch('/api/rooms?isActive=true', { credentials: 'include' }),
        fetch('/api/semesters?current=true', { credentials: 'include' }),
      ]);

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setRecurringBookings(data.data || data || []);
      }

      if (roomsRes.ok) {
        const data = await roomsRes.json();
        setRooms(data.data || data || []);
      }

      if (semestersRes.ok) {
        const data = await semestersRes.json();
        setSemesters(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('errors.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.daysOfWeek.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/recurring-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(t('success.created'));
        setIsDialogOpen(false);
        setFormData({
          roomId: '',
          semesterId: '',
          daysOfWeek: [],
          startTime: '',
          endTime: '',
          purpose: '',
        });
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create recurring booking');
      }
    } catch (error) {
      console.error('Error creating recurring booking:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring booking?')) return;

    try {
      const res = await fetch(`/api/recurring-bookings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(t('success.deleted'));
        fetchData();
      } else {
        toast.error(t('errors.somethingWentWrong'));
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('An error occurred');
    }
  };

  const formatTime = (timeString: string) => {
    // timeString is in "HH:mm" format
    return timeString;
  };

  const getDayNames = (days: number[]) => {
    return days.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label.slice(0, 3)).join(', ');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500">{t('booking.status.approved')}</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">{t('booking.status.pending')}</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">{t('booking.status.rejected')}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recurring Bookings</h1>
          <p className="text-muted-foreground">Manage your weekly recurring room bookings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Recurring Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Recurring Booking</DialogTitle>
              <DialogDescription>
                Set up a weekly recurring room booking
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Room</Label>
                <Select
                  value={formData.roomId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, roomId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} ({room.capacity} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Semester</Label>
                <Select
                  value={formData.semesterId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, semesterId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {semester.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={formData.daysOfWeek.includes(day.value)}
                        onCheckedChange={() => handleDayToggle(day.value)}
                      />
                      <label htmlFor={`day-${day.value}`} className="text-sm">
                        {day.label.slice(0, 3)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Purpose</Label>
                <Textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="e.g., Weekly team meeting"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {recurringBookings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No recurring bookings yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a recurring booking for regular weekly meetings
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recurringBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      {booking.room.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {booking.room.building}{booking.room.floor ? `, Floor ${booking.room.floor}` : ''}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(booking.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Every {getDayNames(booking.daysOfWeek)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {booking.semester?.name || 'Custom period'}
                  </div>
                </div>
                {booking.purpose && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    <span className="font-medium">Purpose:</span> {booking.purpose}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
