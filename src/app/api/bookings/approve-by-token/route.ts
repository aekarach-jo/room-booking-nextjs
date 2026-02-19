import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/bookings/approve-by-token?token=xxx — fetch booking details for the approval page
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const approvalToken = await prisma.bookingApprovalToken.findUnique({
      where: { token },
      include: {
        booking: {
          include: {
            room: { select: { id: true, name: true, type: true, building: true, floor: true } },
            user: { select: { id: true, fullName: true, email: true, studentId: true, department: true } },
          },
        },
      },
    });

    if (!approvalToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    if (approvalToken.usedAt) {
      return NextResponse.json(
        { error: 'This link has already been used', status: approvalToken.booking.status },
        { status: 410 }
      );
    }

    if (approvalToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This link has expired' }, { status: 410 });
    }

    if (approvalToken.booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This booking has already been processed', status: approvalToken.booking.status },
        { status: 409 }
      );
    }

    const { booking } = approvalToken;
    return NextResponse.json({
      bookingId: booking.id,
      status: booking.status,
      room: booking.room,
      student: booking.user,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose,
      attendees: booking.attendees,
      expiresAt: approvalToken.expiresAt,
    });
  } catch (error) {
    console.error('Approve-by-token GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/bookings/approve-by-token — approve or reject booking via token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action, reason } = body as {
      token: string;
      action: 'approve' | 'reject';
      reason?: string;
    };

    if (!token || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (action === 'reject' && !reason?.trim()) {
      return NextResponse.json({ error: 'Reason is required when rejecting' }, { status: 400 });
    }

    const approvalToken = await prisma.bookingApprovalToken.findUnique({
      where: { token },
      include: { booking: { include: { room: { select: { name: true } }, user: true } } },
    });

    if (!approvalToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    if (approvalToken.usedAt) {
      return NextResponse.json(
        { error: 'This link has already been used', status: approvalToken.booking.status },
        { status: 410 }
      );
    }

    if (approvalToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This link has expired' }, { status: 410 });
    }

    if (approvalToken.booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This booking has already been processed', status: approvalToken.booking.status },
        { status: 409 }
      );
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const { booking } = approvalToken;

    // Update booking + mark token as used in a transaction
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: newStatus,
          adminNote: action === 'reject' ? reason : undefined,
        },
      }),
      prisma.bookingApprovalToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
      prisma.notification.create({
        data: {
          userId: booking.userId,
          type: newStatus === 'APPROVED' ? 'BOOKING_APPROVED' : 'BOOKING_REJECTED',
          title: newStatus === 'APPROVED' ? 'Booking Approved' : 'Booking Rejected',
          message:
            newStatus === 'APPROVED'
              ? `Your booking for ${booking.room.name} has been approved.`
              : `Your booking for ${booking.room.name} has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, status: newStatus, bookingId: booking.id });
  } catch (error) {
    console.error('Approve-by-token POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
