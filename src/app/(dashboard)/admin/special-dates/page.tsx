'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SpecialDate {
  id: string;
  date: string;
  name: string;
  description: string | null;
  type: string;
  createdAt: string;
}

const DATE_TYPES = [
  { value: 'HOLIDAY', label: 'Holiday' },
  { value: 'EXAM_PERIOD', label: 'Exam Period' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'SPECIAL_EVENT', label: 'Special Event' },
  { value: 'OTHER', label: 'Other' },
];

export default function SpecialDatesPage() {
  const { t } = useTranslation();
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<SpecialDate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    name: '',
    description: '',
    type: 'HOLIDAY',
  });

  useEffect(() => {
    fetchSpecialDates();
  }, []);

  const fetchSpecialDates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/special-dates', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSpecialDates(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching special dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      name: '',
      description: '',
      type: 'HOLIDAY',
    });
    setEditingDate(null);
  };

  const openEditDialog = (specialDate: SpecialDate) => {
    setEditingDate(specialDate);
    setFormData({
      date: new Date(specialDate.date).toISOString().split('T')[0],
      name: specialDate.name,
      description: specialDate.description || '',
      type: specialDate.type,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        date: formData.date,
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
      };

      const url = editingDate ? `/api/special-dates/${editingDate.id}` : '/api/special-dates';
      const method = editingDate ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingDate ? t('success.updated') : t('success.created'));
        setIsDialogOpen(false);
        resetForm();
        fetchSpecialDates();
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this special date?')) return;

    try {
      const res = await fetch(`/api/special-dates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(t('success.deleted'));
        fetchSpecialDates();
      } else {
        toast.error(t('errors.somethingWentWrong'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'HOLIDAY':
        return <Badge variant="destructive">Holiday</Badge>;
      case 'EXAM_PERIOD':
        return <Badge className="bg-orange-500">Exam</Badge>;
      case 'MAINTENANCE':
        return <Badge className="bg-yellow-500">Maintenance</Badge>;
      case 'SPECIAL_EVENT':
        return <Badge className="bg-purple-500">Event</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
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
          <h1 className="text-2xl font-bold">{t('admin.specialDates.title')}</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Special Date
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingDate ? 'Edit Special Date' : 'Add Special Date'}</DialogTitle>
              <DialogDescription>
                {editingDate ? 'Update special date details' : 'Mark a date as holiday or special event'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., New Year's Day"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details..."
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingDate ? 'Update' : 'Create'}
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
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialDates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No special dates found
                  </TableCell>
                </TableRow>
              ) : (
                specialDates.map((specialDate) => (
                  <TableRow key={specialDate.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(specialDate.date)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{specialDate.name}</TableCell>
                    <TableCell>{getTypeBadge(specialDate.type)}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {specialDate.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(specialDate)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(specialDate.id)}>
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
    </div>
  );
}
