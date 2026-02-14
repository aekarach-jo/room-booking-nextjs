'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Room {
  id: string;
  name: string;
  description: string | null;
  building: string | null;
  floor: number | null;
  capacity: number;
  type: string;
  equipment: string[];
  isActive: boolean;
  openTime: string;
  closeTime: string;
  maxBookingHours: number;
  advanceBookingDays: number;
  requireApproval: boolean;
  createdAt: string;
}

const ROOM_TYPE_VALUES = ['LECTURE', 'COMPUTER_LAB', 'LABORATORY', 'MEETING', 'STUDY'];

export default function RoomsPage() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    building: '',
    floor: '',
    capacity: '',
    type: 'LECTURE',
    equipment: '',
    isActive: true,
    openTime: '08:00',
    closeTime: '20:00',
    maxBookingHours: '3',
    advanceBookingDays: '7',
    requireApproval: true,
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rooms', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRooms(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      building: '',
      floor: '',
      capacity: '',
      type: 'LECTURE',
      equipment: '',
      isActive: true,
      openTime: '08:00',
      closeTime: '20:00',
      maxBookingHours: '3',
      advanceBookingDays: '7',
      requireApproval: true,
    });
    setEditingRoom(null);
  };

  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description || '',
      building: room.building || '',
      floor: room.floor?.toString() || '',
      capacity: room.capacity.toString(),
      type: room.type,
      equipment: room.equipment?.join(', ') || '',
      isActive: room.isActive,
      openTime: room.openTime || '08:00',
      closeTime: room.closeTime || '20:00',
      maxBookingHours: room.maxBookingHours?.toString() || '3',
      advanceBookingDays: room.advanceBookingDays?.toString() || '7',
      requireApproval: room.requireApproval ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        building: formData.building || undefined,
        floor: formData.floor ? parseInt(formData.floor) : undefined,
        capacity: parseInt(formData.capacity),
        type: formData.type,
        equipment: formData.equipment ? formData.equipment.split(',').map(s => s.trim()).filter(Boolean) : [],
        isActive: formData.isActive,
        openTime: formData.openTime,
        closeTime: formData.closeTime,
        maxBookingHours: parseInt(formData.maxBookingHours),
        advanceBookingDays: parseInt(formData.advanceBookingDays),
        requireApproval: formData.requireApproval,
      };

      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
      const method = editingRoom ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingRoom ? t('success.updated') : t('success.created'));
        setIsDialogOpen(false);
        resetForm();
        fetchRooms();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/rooms/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(t('success.deleted'));
        setDeleteId(null);
        fetchRooms();
      } else {
        toast.error(t('errors.somethingWentWrong'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  };

  const handleToggleActive = async (room: Room) => {
    try {
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !room.isActive }),
      });

      if (res.ok) {
        toast.success(t('success.updated'));
        fetchRooms();
      }
    } catch (error) {
      console.error('Error:', error);
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
          <h1 className="text-2xl font-bold">{t('navigation.rooms')}</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('room.addRoom')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRoom ? t('room.editRoom') : t('room.addNewRoom')}</DialogTitle>
              <DialogDescription>
                {editingRoom ? t('room.updateRoomDetails') : t('room.createNewRoom')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('room.roomName')} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Computer Lab 201"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('room.building')}</Label>
                  <Input
                    value={formData.building}
                    onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                    placeholder="e.g., Building B"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('room.floor')}</Label>
                  <Input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                    placeholder="e.g., 2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('room.capacity')} *</Label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    placeholder="e.g., 30"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('room.type')}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPE_VALUES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {t(`room.types.${value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('room.openTime')}</Label>
                  <Input
                    type="time"
                    value={formData.openTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, openTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('room.closeTime')}</Label>
                  <Input
                    type="time"
                    value={formData.closeTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, closeTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('room.maxBookingHours')}</Label>
                  <Input
                    type="number"
                    value={formData.maxBookingHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxBookingHours: e.target.value }))}
                    min="1"
                    max="12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('room.advanceBookingDays')}</Label>
                  <Input
                    type="number"
                    value={formData.advanceBookingDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, advanceBookingDays: e.target.value }))}
                    min="1"
                    max="90"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('room.description')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Room description..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('room.equipment')}</Label>
                <Input
                  value={formData.equipment}
                  onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
                  placeholder="e.g., Projector, Whiteboard, AC"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireApproval"
                    checked={formData.requireApproval}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireApproval: checked }))}
                  />
                  <Label htmlFor="requireApproval">{t('room.requireApproval')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">{t('room.active')}</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('common.loading') : editingRoom ? t('common.save') : t('common.create')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.room')}</TableHead>
                <TableHead>{t('room.location')}</TableHead>
                <TableHead>{t('room.type')}</TableHead>
                <TableHead>{t('room.capacity')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t('room.noRoomsFound')}
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{room.name}</p>
                        {room.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {room.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {[room.building, room.floor ? `${t('room.floor')} ${room.floor}` : null].filter(Boolean).join(', ') || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ROOM_TYPE_VALUES.includes(room.type) ? t(`room.types.${room.type}`) : room.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {room.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={room.isActive}
                        onCheckedChange={() => handleToggleActive(room)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(room)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(room.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('room.confirmDelete')}</DialogTitle>
            <DialogDescription>
              {t('room.confirmDeleteDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
