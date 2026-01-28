'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Building2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.username, formData.password);
      toast.success(t('auth.loginButton') + ' ' + t('success.saved').split(' ')[0] + '!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center pb-8">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary rounded-2xl shadow-lg shadow-primary/25">
            <Building2 className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">{t('auth.loginTitle')}</CardTitle>
        <CardDescription className="text-muted-foreground">{t('auth.loginDescription')}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 px-6">
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
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 px-6 pb-8 pt-2">
          <Button type="submit" className="w-full h-11 rounded-xl font-semibold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.loginButton')}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            {t('auth.dontHaveAccount')}{' '}
            <Link href="/register" className="text-primary font-medium hover:underline underline-offset-4">
              {t('auth.register')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
