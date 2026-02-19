'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Building2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    role: 'STUDENT' as 'STUDENT' | 'TEACHER',
    studentId: '',
    teacherId: '',
    department: '',
    year: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('errors.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('errors.invalidPassword'));
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        studentId: formData.role === 'STUDENT' ? formData.studentId : undefined,
        teacherId: formData.role === 'TEACHER' ? formData.teacherId : undefined,
        department: formData.department || undefined,
        year: formData.role === 'STUDENT' && formData.year ? parseInt(formData.year) : undefined,
      });
      toast.success(t('success.created'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary rounded-2xl shadow-lg shadow-primary/25">
            <Building2 className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">{t('auth.registerTitle')}</CardTitle>
        <CardDescription className="text-muted-foreground">{t('auth.registerDescription')}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 px-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">{t('auth.fullName')}</Label>
            <Input
              id="fullName"
              type="text"
              placeholder={t('auth.fullName')}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              disabled={isLoading}
              className="h-11 rounded-xl border-input/50 focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@rmuti.ac.th"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
              className="h-11 rounded-xl border-input/50 focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">{t('auth.username')}</Label>
            <Input
              id="username"
              type="text"
              placeholder={t('auth.username')}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={isLoading}
              className="h-11 rounded-xl border-input/50 focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.password')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                className="h-11 rounded-xl border-input/50 focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('auth.confirmPassword')}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
                className="h-11 rounded-xl border-input/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'STUDENT' | 'TEACHER') => setFormData({ ...formData, role: value })}
              disabled={isLoading}
            >
              <SelectTrigger className="h-11 rounded-xl border-input/50">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="STUDENT" className="rounded-lg">Student</SelectItem>
                <SelectItem value="TEACHER" className="rounded-lg">Teacher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === 'STUDENT' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-sm font-medium">Student ID</Label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="e.g., 6501234567"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  disabled={isLoading}
                  className="h-11 rounded-xl border-input/50 focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium">Year</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => setFormData({ ...formData, year: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11 rounded-xl border-input/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="1" className="rounded-lg">Year 1</SelectItem>
                    <SelectItem value="2" className="rounded-lg">Year 2</SelectItem>
                    <SelectItem value="3" className="rounded-lg">Year 3</SelectItem>
                    <SelectItem value="4" className="rounded-lg">Year 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {formData.role === 'TEACHER' && (
            <div className="space-y-2">
              <Label htmlFor="teacherId" className="text-sm font-medium">Teacher ID</Label>
              <Input
                id="teacherId"
                type="text"
                placeholder="e.g., T12345"
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                disabled={isLoading}
                className="h-11 rounded-xl border-input/50 focus:border-primary transition-colors"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">{t('auth.department')}</Label>
            <Input
              id="department"
              type="text"
              placeholder={t('auth.department')}
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              disabled={isLoading}
              className="h-11 rounded-xl border-input/50 focus:border-primary transition-colors"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 px-6 pb-8 pt-2">
          <Button type="submit" className="w-full h-11 rounded-xl font-semibold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.registerButton')}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
              {t('auth.login')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
