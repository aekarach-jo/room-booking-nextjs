'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Clock, MapPin, Users, XCircle, LogIn, LogOut } from 'lucide-react';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: number;
  status: string;
  adminNote?: string;
  checkInTime?: string;
  checkOutTime?: string;
  room: {
    id: string;
    name: string;
    type: string;
    building?: string;
    floor?: number;
  };
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchBookings = async (upcoming: boolean) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings/my?${upcoming ? 'upcoming=true' : 'past=true'}&limit=50`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(activeTab === 'upcoming');
  }, [activeTab]);

  const handleCancel = async () => {
    if (!selectedBooking) return;

    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to cancel booking');
      }

      toast.success('Booking cancelled');
      fetchBookings(activeTab === 'upcoming');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel booking');
    } finally {
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/check-in`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to check in');
      }

      toast.success('Checked in successfully');
      fetchBookings(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to check in');
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/check-out`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to check out');
      }

      toast.success('Checked out successfully');
      fetchBookings(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to check out');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const canCheckIn = (booking: Booking) => {
    if (booking.status !== 'APPROVED' || booking.checkInTime) return false;
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const earlyWindow = 15 * 60 * 1000; // 15 minutes
    return now >= new Date(startTime.getTime() - earlyWindow) && now < endTime;
  };

  const canCheckOut = (booking: Booking) => {
    return booking.checkInTime && !booking.checkOutTime;
  };

  const canCancel = (booking: Booking) => {
    if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') return false;
    return new Date(booking.endTime) > new Date();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your room bookings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="rounded-xl p-1">
          <TabsTrigger value="upcoming" className="rounded-lg">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="rounded-lg">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : bookings.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Clock className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                <Button className="rounded-xl" onClick={() => window.location.href = '/bookings'}>
                  Book a Room
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{booking.room.name}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <div className="p-1 rounded-md bg-muted">
                              <Clock className="h-3.5 w-3.5" />
                            </div>
                            <span>{formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                          </div>
                          {booking.room.building && (
                            <div className="flex items-center gap-1.5">
                              <div className="p-1 rounded-md bg-muted">
                                <MapPin className="h-3.5 w-3.5" />
                              </div>
                              <span>{booking.room.building}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <div className="p-1 rounded-md bg-muted">
                              <Users className="h-3.5 w-3.5" />
                            </div>
                            <span>{booking.attendees} attendees</span>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80">{booking.purpose}</p>
                        {booking.adminNote && (
                          <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                              Note: {booking.adminNote}
                            </p>
                          </div>
                        )}
                        {booking.checkInTime && (
                          <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20">
                            <p className="text-sm text-green-700 dark:text-green-400">
                              Checked in at {formatTime(booking.checkInTime)}
                              {booking.checkOutTime && ` - Checked out at ${formatTime(booking.checkOutTime)}`}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {canCheckIn(booking) && (
                          <Button size="sm" className="rounded-xl" onClick={() => handleCheckIn(booking.id)}>
                            <LogIn className="h-4 w-4 mr-1.5" />
                            Check In
                          </Button>
                        )}
                        {canCheckOut(booking) && (
                          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => handleCheckOut(booking.id)}>
                            <LogOut className="h-4 w-4 mr-1.5" />
                            Check Out
                          </Button>
                        )}
                        {canCancel(booking) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-xl"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setCancelDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1.5" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : bookings.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Clock className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No past bookings</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="border-0 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                  <CardContent className="p-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{booking.room.name}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(booking.date)}</span>
                        <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                      </div>
                      <p className="text-sm text-foreground/70">{booking.purpose}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground">
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
