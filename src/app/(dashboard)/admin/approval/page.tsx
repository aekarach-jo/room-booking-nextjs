'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  attendeeCount: number;
  room: {
    name: string;
    location: string;
    type: string;
  };
  user: {
    fullName: string;
    email: string;
    department: string;
  };
  createdAt: string;
}

export default function ApprovalPage() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: statusFilter,
      });

      const res = await fetch(`/api/bookings?${params}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const handleAction = async () => {
    if (!selectedBooking || !actionType) return;

    setIsSubmitting(true);
    try {
      const endpoint = actionType === 'approve'
        ? `/api/bookings/${selectedBooking.id}/approve`
        : `/api/bookings/${selectedBooking.id}/reject`;

      const body = actionType === 'reject'
        ? JSON.stringify({ reason: rejectReason })
        : undefined;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body,
      });

      if (res.ok) {
        toast.success(actionType === 'approve' ? t('success.updated') : t('success.updated'));
        setSelectedBooking(null);
        setActionType(null);
        setRejectReason('');
        fetchBookings();
      } else {
        const error = await res.json();
        toast.error(error.error || `Failed to ${actionType} booking`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500">{t('booking.status.approved')}</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">{t('booking.status.pending')}</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">{t('booking.status.rejected')}</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline">{t('booking.status.cancelled')}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.approval.title')}</h1>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No {statusFilter.toLowerCase()} bookings</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{booking.room.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4" />
                          {booking.room.location}
                        </CardDescription>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.user.fullName}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.attendeeCount} attendees
                      </div>
                    </div>

                    {booking.purpose && (
                      <p className="text-sm text-muted-foreground mb-4">
                        <span className="font-medium">Purpose:</span> {booking.purpose}
                      </p>
                    )}

                    {booking.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setActionType('approve');
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setActionType('reject');
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve/Reject Dialog */}
      <Dialog open={!!selectedBooking && !!actionType} onOpenChange={() => { setSelectedBooking(null); setActionType(null); setRejectReason(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Booking' : 'Reject Booking'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Are you sure you want to approve this booking?'
                : 'Please provide a reason for rejecting this booking.'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Room:</span> {selectedBooking.room.name}</p>
              <p><span className="font-medium">Date:</span> {formatDate(selectedBooking.date)}</p>
              <p><span className="font-medium">Time:</span> {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}</p>
              <p><span className="font-medium">Requester:</span> {selectedBooking.user.fullName}</p>
            </div>
          )}

          {actionType === 'reject' && (
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason..."
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedBooking(null); setActionType(null); setRejectReason(''); }}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isSubmitting || (actionType === 'reject' && !rejectReason)}
              className={actionType === 'approve' ? 'bg-green-500 hover:bg-green-600' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {isSubmitting ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
