import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/bookings/[id]/check-out - Check out from booking
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: {
          select: { name: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only booking owner can check out
    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Must have checked in first
    if (!booking.checkInTime) {
      return NextResponse.json(
        { error: 'Must check in before checking out' },
        { status: 400 }
      );
    }

    // Already checked out
    if (booking.checkOutTime) {
      return NextResponse.json(
        { error: 'Already checked out' },
        { status: 400 }
      );
    }

    const now = new Date();

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { checkOutTime: now },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
