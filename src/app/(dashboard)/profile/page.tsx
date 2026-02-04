'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Building, GraduationCap, Shield, Calendar, AlertTriangle, Phone, MapPin, BookOpen, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    department: user?.department || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: Record<string, string> = {
        fullName: formData.fullName,
        department: formData.department,
      };

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error(t('errors.passwordMismatch'));
          setIsSubmitting(false);
          return;
        }
        if (!formData.currentPassword) {
          toast.error(t('errors.required'));
          setIsSubmitting(false);
          return;
        }
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(t('success.updated'));
        setIsEditing(false);
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'DEPARTMENT_HEAD':
        return <Badge className="bg-purple-500">Department Head</Badge>;
      case 'STAFF':
        return <Badge className="bg-blue-500">Staff</Badge>;
      case 'TEACHER':
        return <Badge className="bg-green-500">Teacher</Badge>;
      default:
        return <Badge variant="secondary">Student</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.fullName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <CardTitle>{user.fullName}</CardTitle>
                {user.fullNameEn && (
                  <p className="text-sm text-muted-foreground">{user.fullNameEn}</p>
                )}
                <CardDescription>@{user.username}</CardDescription>
              </div>
            </div>
            {getRoleBadge(user.role)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Student/Teacher ID */}
            {user.studentId && (
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('profile.studentId')}</p>
                  <p className="text-sm text-muted-foreground">{user.studentId}</p>
                </div>
              </div>
            )}
            {user.teacherId && (
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('profile.teacherId')}</p>
                  <p className="text-sm text-muted-foreground">{user.teacherId}</p>
                </div>
              </div>
            )}

            {/* Email */}
            {user.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('profile.email')}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}

            {/* Phone */}
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('profile.phone')}</p>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Faculty */}
            {user.faculty && (
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('profile.faculty')}</p>
                  <p className="text-sm text-muted-foreground">{user.faculty}</p>
                </div>
              </div>
            )}

            {/* Department/Program */}
            {(user.department || user.program) && (
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('profile.program')}</p>
                  <p className="text-sm text-muted-foreground">{user.program || user.department}</p>
                </div>
              </div>
            )}

            {/* Degree Level */}
            {user.degreeLevel && (
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('profile.degreeLevel')}</p>
                  <p className="text-sm text-muted-foreground">{user.degreeLevel}</p>
                </div>
              </div>
            )}

            {/* Year */}
            {user.year && (
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('profile.year')}</p>
                  <p className="text-sm text-muted-foreground">{t('profile.yearValue', { year: user.year })}</p>
                </div>
              </div>
            )}

            {/* Campus */}
            {user.campus && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('profile.campus')}</p>
                  <p className="text-sm text-muted-foreground">{user.campus}</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Member since */}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('profile.memberSince')}</p>
                <p className="text-sm text-muted-foreground">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }) : '-'}
                </p>
              </div>
            </div>

            {/* Last Login */}
            {user.lastLoginAt && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('profile.lastLogin')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.lastLoginAt).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warning if suspended */}
      {user.isSuspended && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Account Suspended</p>
                <p className="text-sm">
                  Your account has been suspended due to repeated no-shows.
                  {user.suspendedUntil && (
                    <> Suspension ends on {new Date(user.suspendedUntil).toLocaleDateString('th-TH')}.</>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        {isEditing && (
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="text-sm font-medium mb-4">Change Password (Optional)</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      fullName: user?.fullName || '',
                      department: user?.department || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
