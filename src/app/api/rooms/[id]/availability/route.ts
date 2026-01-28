import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/rooms/[id]/availability - Get room availability for a date range
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    // Get room
    const room = await prisma.room.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        openTime: true,
        closeTime: true,
        isActive: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!room.isActive) {
      return NextResponse.json({ error: 'Room is not active' }, { status: 400 });
    }

    // Calculate date range
    let startDate: Date;
    let endDate: Date;

    if (dateStr) {
      // Single date
      startDate = new Date(dateStr);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dateStr);
      endDate.setHours(23, 59, 59, 999);
    } else if (startDateStr && endDateStr) {
      startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to today
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    // Get bookings for the date range
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: id,
        status: { in: ['PENDING', 'APPROVED'] },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        purpose: true,
        user: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Get maintenance windows
    const maintenances = await prisma.roomMaintenance.findMany({
      where: {
        roomId: id,
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        reason: true,
      },
    });

    // Get special dates (holidays)
    const specialDates = await prisma.specialDate.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        type: 'HOLIDAY',
      },
      select: {
        id: true,
        name: true,
        date: true,
        type: true,
      },
    });

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        openTime: room.openTime,
        closeTime: room.closeTime,
      },
      dateRange: {
        startDate,
        endDate,
      },
      bookings,
      maintenances,
      specialDates,
    });
  } catch (error) {
    console.error('Get room availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
