import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET /api/analytics/booking-trends
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Get bookings grouped by date
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Group by date
    const trendMap = new Map<string, { total: number; approved: number; rejected: number; cancelled: number }>();

    // Initialize all dates
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      trendMap.set(dateStr, { total: 0, approved: 0, rejected: 0, cancelled: 0 });
    }

    // Count bookings
    bookings.forEach(booking => {
      const dateStr = booking.createdAt.toISOString().split('T')[0];
      const data = trendMap.get(dateStr);
      if (data) {
        data.total++;
        if (booking.status === 'APPROVED') data.approved++;
        else if (booking.status === 'REJECTED') data.rejected++;
        else if (booking.status === 'CANCELLED') data.cancelled++;
      }
    });

    // Convert to array
    const trends = Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    // Sort by date
    trends.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Get booking trends error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
