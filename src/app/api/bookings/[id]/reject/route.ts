import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { approveRejectSchema } from '@/lib/validations/booking';

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/bookings/[id]/reject - Reject booking (admin only)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only reject pending bookings' },
        { status: 400 }
      );
    }

    // Parse admin note if provided
    let adminNote: string | undefined;
    try {
      const body = await request.json();
      const result = approveRejectSchema.safeParse(body);
      if (result.success) {
        adminNote = result.data.adminNote;
      }
    } catch {
      // No body provided, which is fine
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNote,
      },
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

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'BOOKING_REJECTED',
        title: 'Booking Rejected',
        message: `Your booking for ${booking.room.name} has been rejected.${adminNote ? ` Reason: ${adminNote}` : ''}`,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Reject booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
