import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET /api/analytics/room-usage
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        openTime: true,
        closeTime: true,
        bookings: {
          where: {
            date: { gte: start, lte: end },
            status: 'APPROVED',
          },
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    const roomUsage = rooms.map(room => {
      // Calculate total booked hours
      let totalHours = 0;
      room.bookings.forEach(booking => {
        const start = new Date(booking.startTime);
        const end = new Date(booking.endTime);
        totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      });

      // Calculate available hours per day
      const openTime = room.openTime ? parseInt(room.openTime.split(':')[0]) : 8;
      const closeTime = room.closeTime ? parseInt(room.closeTime.split(':')[0]) : 20;
      const hoursPerDay = closeTime - openTime;

      // Calculate number of days in range
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const totalAvailableHours = hoursPerDay * days;

      const utilizationRate = totalAvailableHours > 0
        ? Math.round((totalHours / totalAvailableHours) * 100)
        : 0;

      return {
        roomId: room.id,
        roomName: room.name,
        roomType: room.type,
        totalBookings: room.bookings.length,
        totalHours: Math.round(totalHours * 10) / 10,
        utilizationRate,
      };
    });

    // Sort by utilization rate descending
    roomUsage.sort((a, b) => b.utilizationRate - a.utilizationRate);

    return NextResponse.json(roomUsage);
  } catch (error) {
    console.error('Get room usage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
