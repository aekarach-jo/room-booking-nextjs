'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Building2,
  Users,
  TrendingUp,
} from 'lucide-react';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  todayBookings: number;
  totalRooms: number;
  activeUsers: number;
}

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  room: {
    name: string;
    type: string;
  };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isPinned: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'STAFF' || user?.role === 'DEPARTMENT_HEAD';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch upcoming bookings
        const bookingsRes = await fetch('/api/bookings/my?upcoming=true&limit=5', {
          credentials: 'include',
        });
        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setUpcomingBookings(data.data || []);
        }

        // Fetch announcements
        const announcementsRes = await fetch('/api/announcements?limit=3', {
          credentials: 'include',
        });
        if (announcementsRes.ok) {
          const data = await announcementsRes.json();
          setAnnouncements(data.slice(0, 3) || []);
        }

        // Fetch stats for admin
        if (isAdmin) {
          const statsRes = await fetch('/api/analytics/overview', {
            credentials: 'include',
          });
          if (statsRes.ok) {
            const data = await statsRes.json();
            setStats(data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

  const getAnnouncementBadge = (type: string) => {
    switch (type) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'WARNING':
        return <Badge className="bg-yellow-500">Warning</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary to-primary/80 p-6 sm:p-8 text-primary-foreground shadow-lg">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold">{t('dashboard.welcome')}, {user?.fullName}</h1>
          <p className="mt-2 text-primary-foreground/80 max-w-lg">
            {t('common.appName')}
          </p>
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-5 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* Admin Stats */}
      {isAdmin && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-linear-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.todayBookings')}</CardTitle>
              <div className="p-2 rounded-xl bg-primary/10">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-linear-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.pendingApproval')}</CardTitle>
              <div className="p-2 rounded-xl bg-yellow-500/10">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingBookings}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-linear-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.totalRooms')}</CardTitle>
              <div className="p-2 rounded-xl bg-green-500/10">
                <Building2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRooms}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-linear-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('admin.users.title')}</CardTitle>
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeUsers}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/bookings">
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <CalendarDays className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <span>{t('navigation.bookRoom')}</span>
                </CardTitle>
                <CardDescription className="pl-12">
                  {t('booking.createBooking')}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/bookings/my">
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Clock className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <span>{t('navigation.myBookings')}</span>
                </CardTitle>
                <CardDescription className="pl-12">
                  {t('booking.myBookings')}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/calendar">
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <TrendingUp className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <span>{t('navigation.calendar')}</span>
                </CardTitle>
                <CardDescription className="pl-12">
                  {t('calendar.title')}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">{t('dashboard.upcomingBookings')}</CardTitle>
            </div>
            <Link href="/bookings/my?upcoming=true">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                {t('common.all')} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <CalendarDays className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">{t('dashboard.noUpcomingBookings')}</p>
                <Link href="/bookings">
                  <Button variant="outline" size="sm" className="mt-3">
                    {t('navigation.bookRoom')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-accent/50 hover:bg-accent transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">{booking.room.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(booking.date)} | {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">{t('announcement.title')}</CardTitle>
            </div>
            <Link href="/announcements">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                {t('common.all')} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">{t('announcement.noAnnouncements')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 rounded-xl bg-accent/50 hover:bg-accent transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold truncate">{announcement.title}</p>
                      {getAnnouncementBadge(announcement.type)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {announcement.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
