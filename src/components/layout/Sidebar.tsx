'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  History,
  Repeat,
  Megaphone,
  CheckCircle,
  DoorOpen,
  Users,
  GraduationCap,
  CalendarRange,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const userNavItems = [
  { href: '/', labelKey: 'navigation.dashboard', icon: LayoutDashboard },
  { href: '/bookings', labelKey: 'navigation.bookRoom', icon: CalendarDays },
  { href: '/bookings/my', labelKey: 'navigation.myBookings', icon: Clock },
  { href: '/calendar', labelKey: 'navigation.calendar', icon: CalendarRange },
  { href: '/history', labelKey: 'navigation.history', icon: History },
  // { href: '/recurring', labelKey: 'navigation.recurring', icon: Repeat },
  { href: '/announcements', labelKey: 'navigation.announcements', icon: Megaphone },
];

const adminNavItems = [
  { href: '/admin/approval', labelKey: 'navigation.approval', icon: CheckCircle },
  { href: '/admin/rooms', labelKey: 'navigation.rooms', icon: DoorOpen },
  { href: '/admin/users', labelKey: 'navigation.users', icon: Users },
  { href: '/admin/semesters', labelKey: 'navigation.semesters', icon: GraduationCap },
  // { href: '/admin/special-dates', labelKey: 'navigation.specialDates', icon: CalendarDays },
  { href: '/admin/announcements', labelKey: 'navigation.announcements', icon: Megaphone },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useTranslation();

  const isAdmin = user?.role === 'STAFF' || user?.role === 'DEPARTMENT_HEAD';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-64 bg-linear-to-b from-sidebar via-sidebar to-sidebar/95 border-r border-sidebar-border shadow-xl transform transition-transform duration-300 ease-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border/50">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <DoorOpen className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">RoomBook</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-sidebar-accent"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {/* User Navigation */}
            <div className="space-y-0.5">
              {userNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', isActive ? '' : 'opacity-70')} />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>

            {/* Admin Navigation */}
            {isAdmin && (
              <>
                <div className="pt-5 pb-2">
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('navigation.admin')}
                  </p>
                </div>
                <div className="space-y-0.5">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        )}
                      >
                        <Icon className={cn('h-5 w-5', isActive ? '' : 'opacity-70')} />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </nav>

          {/* User Info */}
          {user && (
            <div className="p-3 border-t border-sidebar-border/50">
              <div className="flex items-center space-x-3 p-2 rounded-xl bg-sidebar-accent/50">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-semibold text-primary-foreground">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-sidebar-foreground">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
