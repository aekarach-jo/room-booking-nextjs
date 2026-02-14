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
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Mail, Building, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  fullName: string;
  department: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_VALUES = ['STUDENT', 'TEACHER', 'STAFF', 'DEPARTMENT_HEAD'];

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    department: '',
    role: 'STUDENT',
    password: '',
    isActive: true,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/users?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      department: '',
      role: 'STUDENT',
      password: '',
      isActive: true,
    });
    setEditingUser(null);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      department: user.department,
      role: user.role,
      password: '',
      isActive: user.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        email: formData.email,
        fullName: formData.fullName,
        department: formData.department,
        role: formData.role,
        isActive: formData.isActive,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingUser ? t('success.updated') : t('success.created'));
        setIsDialogOpen(false);
        resetForm();
        fetchUsers();
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
      const res = await fetch(`/api/users/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(t('success.deleted'));
        setDeleteId(null);
        fetchUsers();
      } else {
        toast.error(t('errors.somethingWentWrong'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (res.ok) {
        toast.success(t('success.updated'));
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'DEPARTMENT_HEAD':
        return <Badge className="bg-purple-500">{t('admin.users.roles.DEPARTMENT_HEAD')}</Badge>;
      case 'STAFF':
        return <Badge className="bg-blue-500">{t('admin.users.roles.STAFF')}</Badge>;
      case 'TEACHER':
        return <Badge className="bg-green-600">{t('admin.users.roles.TEACHER')}</Badge>;
      default:
        return <Badge variant="secondary">{t('admin.users.roles.STUDENT')}</Badge>;
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
          <h1 className="text-2xl font-bold">{t('admin.users.title')}</h1>
          <p className="text-muted-foreground">{t('admin.users.subtitle')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.users.addUser')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? t('admin.users.editUser') : t('admin.users.addNewUser')}</DialogTitle>
              <DialogDescription>
                {editingUser ? t('admin.users.updateUserInfo') : t('admin.users.createNewUser')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('admin.users.email')} *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.users.fullName')} *</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.users.department')} *</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Computer Science"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.users.role')}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {t(`admin.users.roles.${value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{editingUser ? t('admin.users.newPassword') : `${t('admin.users.password')} *`}</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required={!editingUser}
                  minLength={6}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="userIsActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="userIsActive">{t('admin.users.active')}</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('common.loading') : editingUser ? t('common.save') : t('common.create')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.users.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">{t('common.search')}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('navigation.users')}</TableHead>
                <TableHead>{t('admin.users.department')}</TableHead>
                <TableHead>{t('admin.users.role')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t('admin.users.noUsersFound')}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {user.department}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleActive(user)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(user.id)}>
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('admin.users.pageOf').replace('{page}', page.toString()).replace('{total}', totalPages.toString())}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            {t('common.previous')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {t('common.next')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('admin.users.confirmDelete')}</DialogTitle>
            <DialogDescription>
              {t('admin.users.confirmDeleteDesc')}
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
