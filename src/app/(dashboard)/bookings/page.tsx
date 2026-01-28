'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Building2, Users, Clock } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  building?: string;
  floor?: number;
  equipment?: string[];
  openTime?: string;
  closeTime?: string;
  maxBookingHours?: number;
  requireApproval: boolean;
}

export default function BookingPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    roomId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: '1',
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/rooms?isActive=true', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast.error('Failed to load rooms');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleRoomSelect = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    setSelectedRoom(room || null);
    setFormData({ ...formData, roomId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomId || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create datetime strings
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      toast.error('End time must be after start time');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          roomId: formData.roomId,
          date: startDateTime.toISOString(),
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          purpose: formData.purpose,
          attendees: parseInt(formData.attendees),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      toast.success('Booking created successfully!');
      router.push('/bookings/my');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoomTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      LECTURE: 'bg-blue-500',
      COMPUTER_LAB: 'bg-green-500',
      LABORATORY: 'bg-purple-500',
      MEETING: 'bg-yellow-500',
      STUDY: 'bg-gray-500',
    };
    return <Badge className={colors[type] || 'bg-gray-500'}>{type.replace('_', ' ')}</Badge>;
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Book a Room</h1>
        <p className="text-muted-foreground">Select a room and time slot for your booking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Select a Room</CardTitle>
              <CardDescription>Choose from available rooms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleRoomSelect(room.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedRoom?.id === room.id
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                        : 'border-border hover:border-primary/50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold">{room.name}</h3>
                      {getRoomTypeBadge(room.type)}
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-muted">
                          <Users className="h-3.5 w-3.5" />
                        </div>
                        <span>Capacity: {room.capacity}</span>
                      </div>
                      {room.building && (
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-muted">
                            <Building2 className="h-3.5 w-3.5" />
                          </div>
                          <span>{room.building}{room.floor ? `, Floor ${room.floor}` : ''}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-muted">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <span>{room.openTime || '08:00'} - {room.closeTime || '20:00'}</span>
                      </div>
                    </div>
                    {room.equipment && room.equipment.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
                        {room.equipment.slice(0, 3).map((eq, i) => (
                          <Badge key={i} variant="secondary" className="text-xs rounded-md">
                            {eq}
                          </Badge>
                        ))}
                        {room.equipment.length > 3 && (
                          <Badge variant="secondary" className="text-xs rounded-md">
                            +{room.equipment.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div>
          <Card className="border-0 shadow-md sticky top-20">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>
                {selectedRoom ? `Booking: ${selectedRoom.name}` : 'Select a room first'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    disabled={!selectedRoom || isSubmitting}
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-sm font-medium">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                      disabled={!selectedRoom || isSubmitting}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-sm font-medium">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                      disabled={!selectedRoom || isSubmitting}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendees" className="text-sm font-medium">Number of Attendees</Label>
                  <Input
                    id="attendees"
                    type="number"
                    min="1"
                    max={selectedRoom?.capacity || 100}
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                    required
                    disabled={!selectedRoom || isSubmitting}
                    className="h-11 rounded-xl"
                  />
                  {selectedRoom && (
                    <p className="text-xs text-muted-foreground">
                      Max capacity: {selectedRoom.capacity}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-sm font-medium">Purpose</Label>
                  <Textarea
                    id="purpose"
                    placeholder="What will you use the room for?"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                    disabled={!selectedRoom || isSubmitting}
                    className="rounded-xl min-h-20"
                  />
                </div>

                {selectedRoom?.requireApproval && (
                  <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      This room requires approval. Your booking will be pending until approved.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-semibold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all"
                  disabled={!selectedRoom || isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Booking
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
