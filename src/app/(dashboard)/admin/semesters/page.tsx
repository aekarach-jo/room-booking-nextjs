'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
}

export default function SemestersPage() {
  const { t } = useTranslation();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/semesters', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSemesters(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
    });
    setEditingSemester(null);
  };

  const openEditDialog = (semester: Semester) => {
    setEditingSemester(semester);
    setFormData({
      name: semester.name,
      startDate: new Date(semester.startDate).toISOString().split('T')[0],
      endDate: new Date(semester.endDate).toISOString().split('T')[0],
      isCurrent: semester.isCurrent,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: formData.isCurrent,
      };

      const url = editingSemester ? `/api/semesters/${editingSemester.id}` : '/api/semesters';
      const method = editingSemester ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingSemester ? t('success.updated') : t('success.created'));
        setIsDialogOpen(false);
        resetForm();
        fetchSemesters();
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
      const res = await fetch(`/api/semesters/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(t('success.deleted'));
        setDeleteId(null);
        fetchSemesters();
      } else {
        toast.error(t('errors.somethingWentWrong'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  };

  const handleSetCurrent = async (semester: Semester) => {
    try {
      const res = await fetch(`/api/semesters/${semester.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isCurrent: true }),
      });

      if (res.ok) {
        toast.success(t('success.updated'));
        fetchSemesters();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
          <h1 className="text-2xl font-bold">{t('admin.semesters.title')}</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.semesters.addSemester')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSemester ? t('admin.semesters.editSemester') : t('admin.semesters.addNewSemester')}</DialogTitle>
              <DialogDescription>
                {editingSemester ? t('admin.semesters.updateSemesterDetails') : t('admin.semesters.createNewSemester')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('admin.semesters.semesterName')} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., 1/2567"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.semesters.startDate')} *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.semesters.endDate')} *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isCurrent"
                  checked={formData.isCurrent}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCurrent: checked }))}
                />
                <Label htmlFor="isCurrent">{t('admin.semesters.setAsCurrent')}</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('common.loading') : editingSemester ? t('common.save') : t('common.create')}
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
                <TableHead>{t('admin.semesters.title')}</TableHead>
                <TableHead>{t('admin.semesters.startDate')}</TableHead>
                <TableHead>{t('admin.semesters.endDate')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semesters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t('admin.semesters.noSemestersFound')}
                  </TableCell>
                </TableRow>
              ) : (
                semesters.map((semester) => (
                  <TableRow key={semester.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{semester.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(semester.startDate)}</TableCell>
                    <TableCell>{formatDate(semester.endDate)}</TableCell>
                    <TableCell>
                      {semester.isCurrent ? (
                        <Badge className="bg-green-500">{t('admin.semesters.current')}</Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetCurrent(semester)}
                        >
                          {t('admin.semesters.setCurrent')}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(semester)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(semester.id)}>
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
            <DialogTitle>{t('admin.semesters.confirmDelete')}</DialogTitle>
            <DialogDescription>
              {t('admin.semesters.confirmDeleteDesc')}
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
