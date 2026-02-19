import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { createBookingSchema } from '@/lib/validations/booking';
import { sendBookingApprovalEmail } from '@/lib/email';

// GET /api/bookings - List bookings
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Non-admin users can only see their own bookings or approved bookings
    if (!isAdmin(user)) {
      where.OR = [
        { userId: user.id },
        { status: 'APPROVED' },
      ];
    }

    if (roomId) {
      where.roomId = roomId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate) {
      where.date = { ...((where.date as object) || {}), gte: new Date(startDate) };
    }

    if (endDate) {
      where.date = { ...((where.date as object) || {}), lte: new Date(endDate) };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
          room: {
            select: {
              id: true,
              name: true,
              type: true,
              building: true,
              floor: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      data: bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/bookings - Create booking
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return NextResponse.json(
        { error: 'Your account is suspended. You cannot create bookings.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createBookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { roomId, date, startTime, endTime, purpose, attendees } = result.data;

    // Get room
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!room.isActive) {
      return NextResponse.json({ error: 'Room is not active' }, { status: 400 });
    }

    // Check capacity
    if (attendees > room.capacity) {
      return NextResponse.json(
        { error: `Room capacity is ${room.capacity}` },
        { status: 400 }
      );
    }

    // Check booking duration
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);

    if (room.maxBookingHours && durationHours > room.maxBookingHours) {
      return NextResponse.json(
        { error: `Maximum booking duration is ${room.maxBookingHours} hours` },
        { status: 400 }
      );
    }

    // Check advance booking days
    const bookingDate = new Date(date);
    const now = new Date();
    const daysInAdvance = Math.ceil((bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (room.advanceBookingDays && daysInAdvance > room.advanceBookingDays) {
      return NextResponse.json(
        { error: `Can only book ${room.advanceBookingDays} days in advance` },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: startDateTime } },
              { endTime: { gt: startDateTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endDateTime } },
              { endTime: { gte: endDateTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startDateTime } },
              { endTime: { lte: endDateTime } },
            ],
          },
        ],
      },
    });

    if (overlappingBooking) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 409 }
      );
    }

    // Check for maintenance
    const maintenance = await prisma.roomMaintenance.findFirst({
      where: {
        roomId,
        startDate: { lte: endDateTime },
        endDate: { gte: startDateTime },
      },
    });

    if (maintenance) {
      return NextResponse.json(
        { error: 'Room is under maintenance during this time' },
        { status: 409 }
      );
    }

    // Determine initial status based on room's requireApproval setting
    const initialStatus = room.requireApproval ? 'PENDING' : 'APPROVED';

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        roomId,
        date: new Date(date),
        startTime: startDateTime,
        endTime: endDateTime,
        purpose,
        attendees,
        status: initialStatus,
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

    // Create notification if pending
    if (initialStatus === 'PENDING') {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'BOOKING_REMINDER',
          title: 'Booking Submitted',
          message: `Your booking for ${booking.room.name} has been submitted and is pending approval.`,
        },
      });

      // Generate approval token and send email to configured recipients
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await prisma.bookingApprovalToken.create({
        data: { token, bookingId: booking.id, expiresAt },
      });

      // Get student email
      const studentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { email: true, fullName: true },
      });

      // Get configured email recipients from system settings
      const recipientSetting = await prisma.systemSetting.findUnique({
        where: { key: 'email_notification_recipients' },
      });
      const recipientIds: string[] = Array.isArray(recipientSetting?.value)
        ? (recipientSetting!.value as string[])
        : [];

      const recipients = recipientIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: recipientIds }, isActive: true, email: { not: null } },
            select: { fullName: true, email: true },
          })
        : [];

      if (recipients.length > 0) {
        sendBookingApprovalEmail(
          {
            bookingId: booking.id,
            studentName: studentUser?.fullName || user.username,
            studentEmail: studentUser?.email || null,
            roomName: booking.room.name,
            date: booking.date.toISOString(),
            startTime: booking.startTime.toISOString(),
            endTime: booking.endTime.toISOString(),
            purpose: booking.purpose,
            attendees: booking.attendees,
            approvalToken: token,
          },
          recipients.map((r) => ({ name: r.fullName, email: r.email! }))
        ).catch((err) => console.error('Email send error:', err));
      }
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
