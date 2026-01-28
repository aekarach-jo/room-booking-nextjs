import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/recurring-bookings/[id] - Get recurring booking by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recurringBooking = await prisma.recurringBooking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            type: true,
            building: true,
          },
        },
        bookings: {
          orderBy: { date: 'asc' },
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            status: true,
            checkInTime: true,
            checkOutTime: true,
          },
        },
      },
    });

    if (!recurringBooking) {
      return NextResponse.json({ error: 'Recurring booking not found' }, { status: 404 });
    }

    // Only owner or admin can view
    if (recurringBooking.userId !== user.id && !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(recurringBooking);
  } catch (error) {
    console.error('Get recurring booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/recurring-bookings/[id] - Delete recurring booking and its generated bookings
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recurringBooking = await prisma.recurringBooking.findUnique({
      where: { id },
    });

    if (!recurringBooking) {
      return NextResponse.json({ error: 'Recurring booking not found' }, { status: 404 });
    }

    // Only owner or admin can delete
    if (recurringBooking.userId !== user.id && !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check query param for whether to delete future bookings only
    const { searchParams } = new URL(request.url);
    const futureOnly = searchParams.get('futureOnly') === 'true';

    if (futureOnly) {
      // Only cancel future bookings
      await prisma.booking.updateMany({
        where: {
          recurringBookingId: id,
          date: { gte: new Date() },
          status: { in: ['PENDING', 'APPROVED'] },
        },
        data: { status: 'CANCELLED' },
      });
    } else {
      // Delete all associated bookings
      await prisma.booking.deleteMany({
        where: { recurringBookingId: id },
      });
    }

    // Delete the recurring booking
    await prisma.recurringBooking.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Recurring booking deleted successfully' });
  } catch (error) {
    console.error('Delete recurring booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
