import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/bookings/[id]/check-in - Check in to booking
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

    // Only booking owner can check in
    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Must be approved
    if (booking.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Can only check in to approved bookings' },
        { status: 400 }
      );
    }

    // Already checked in
    if (booking.checkInTime) {
      return NextResponse.json(
        { error: 'Already checked in' },
        { status: 400 }
      );
    }

    // Check time window (allow check-in 15 minutes before to 30 minutes after start time)
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    const earlyCheckInWindow = 15 * 60 * 1000; // 15 minutes
    const lateCheckInWindow = 30 * 60 * 1000; // 30 minutes

    if (now < new Date(startTime.getTime() - earlyCheckInWindow)) {
      return NextResponse.json(
        { error: 'Too early to check in. You can check in 15 minutes before start time.' },
        { status: 400 }
      );
    }

    if (now > new Date(startTime.getTime() + lateCheckInWindow)) {
      // Mark as no-show if trying to check in too late
      await prisma.booking.update({
        where: { id },
        data: { isNoShow: true },
      });

      // Increment user's no-show count
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { noShowCount: { increment: 1 } },
      });

      // Suspend user if too many no-shows (e.g., 3)
      if (updatedUser.noShowCount >= 3) {
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + 7); // 7-day suspension

        await prisma.user.update({
          where: { id: user.id },
          data: {
            isSuspended: true,
            suspendedUntil,
          },
        });
      }

      return NextResponse.json(
        { error: 'Too late to check in. This booking has been marked as no-show.' },
        { status: 400 }
      );
    }

    if (now > endTime) {
      return NextResponse.json(
        { error: 'Booking has already ended' },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { checkInTime: now },
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
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
