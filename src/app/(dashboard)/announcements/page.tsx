'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pin, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'URGENT';
  isPinned: boolean;
  publishDate: string;
  creator: {
    fullName: string;
  };
}

export default function AnnouncementsPage() {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'URGENT':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'WARNING':
        return <Badge className="bg-yellow-500">Warning</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
      <div>
        <h1 className="text-2xl font-bold">{t('announcement.title')}</h1>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{t('announcement.noAnnouncements')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`${
                announcement.type === 'URGENT'
                  ? 'border-red-500 dark:border-red-500/50'
                  : announcement.type === 'WARNING'
                  ? 'border-yellow-500 dark:border-yellow-500/50'
                  : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(announcement.type)}
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {announcement.title}
                        {announcement.isPinned && (
                          <Pin className="h-4 w-4 text-primary" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        Posted by {announcement.creator.fullName} on {formatDate(announcement.publishDate)}
                      </CardDescription>
                    </div>
                  </div>
                  {getTypeBadge(announcement.type)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
