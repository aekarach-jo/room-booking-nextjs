import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET /api/analytics/overview
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalBookings,
      pendingBookings,
      totalRooms,
      activeUsers,
      todayBookings,
      weeklyBookings,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({
        where: { status: 'PENDING' },
      }),
      prisma.room.count({
        where: { isActive: true },
      }),
      prisma.user.count({
        where: { isActive: true },
      }),
      prisma.booking.count({
        where: {
          date: { gte: todayStart, lt: todayEnd },
          status: { in: ['APPROVED', 'PENDING'] },
        },
      }),
      prisma.booking.count({
        where: {
          date: { gte: weekStart },
          status: { in: ['APPROVED', 'PENDING'] },
        },
      }),
    ]);

    return NextResponse.json({
      totalBookings,
      pendingBookings,
      totalRooms,
      activeUsers,
      todayBookings,
      weeklyBookings,
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
