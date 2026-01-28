import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { createRecurringBookingSchema } from '@/lib/validations/recurring-booking';

// GET /api/recurring-bookings - List recurring bookings
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Non-admin users can only see their own recurring bookings
    if (!isAdmin(user)) {
      where.userId = user.id;
    }

    if (roomId) {
      where.roomId = roomId;
    }

    const [recurringBookings, total] = await Promise.all([
      prisma.recurringBooking.findMany({
        where,
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
            },
          },
          _count: {
            select: { bookings: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.recurringBooking.count({ where }),
    ]);

    return NextResponse.json({
      data: recurringBookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get recurring bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/recurring-bookings - Create recurring booking
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: 'Your account is suspended' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createRecurringBookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { roomId, semesterId, startDate, endDate, pattern, daysOfWeek, startTime, endTime, purpose } = result.data;

    // Get room
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room || !room.isActive) {
      return NextResponse.json({ error: 'Room not found or inactive' }, { status: 404 });
    }

    // Get semester if provided
    let semester = null;
    if (semesterId) {
      semester = await prisma.semester.findUnique({
        where: { id: semesterId },
      });
      if (!semester) {
        return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
      }
    }

    // Determine start and end dates
    const effectiveStartDate = semester ? semester.startDate : startDate ? new Date(startDate) : new Date();
    const effectiveEndDate = semester ? semester.endDate : endDate ? new Date(endDate) : null;
    const effectivePattern = pattern || 'CUSTOM';

    // Create recurring booking
    const recurringBooking = await prisma.recurringBooking.create({
      data: {
        userId: user.id,
        roomId,
        semesterId: semesterId || undefined,
        startDate: effectiveStartDate,
        endDate: effectiveEndDate,
        pattern: effectivePattern,
        daysOfWeek: daysOfWeek ? daysOfWeek : undefined,
        startTime,
        endTime,
        purpose: purpose || '',
      },
    });

    // Generate individual bookings
    const bookingsToCreate = [];
    const start = new Date(effectiveStartDate);
    const end = effectiveEndDate ? new Date(effectiveEndDate) : new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000); // Default 90 days

    const currentDate = new Date(start);
    while (currentDate <= end) {
      let shouldCreate = false;

      if (effectivePattern === 'DAILY') {
        shouldCreate = true;
      } else if (effectivePattern === 'WEEKLY') {
        // Create on same day of week as start date
        shouldCreate = currentDate.getDay() === start.getDay();
      } else if (effectivePattern === 'CUSTOM' && daysOfWeek) {
        shouldCreate = daysOfWeek.includes(currentDate.getDay());
      }

      if (shouldCreate) {
        // Parse time strings
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const bookingStartTime = new Date(currentDate);
        bookingStartTime.setHours(startHour, startMin, 0, 0);

        const bookingEndTime = new Date(currentDate);
        bookingEndTime.setHours(endHour, endMin, 0, 0);

        bookingsToCreate.push({
          userId: user.id,
          roomId,
          date: new Date(currentDate),
          startTime: bookingStartTime,
          endTime: bookingEndTime,
          purpose: purpose || '',
          attendees: 1, // Default
          status: room.requireApproval ? 'PENDING' as const : 'APPROVED' as const,
          recurringBookingId: recurringBooking.id,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create bookings in batch
    if (bookingsToCreate.length > 0) {
      await prisma.booking.createMany({
        data: bookingsToCreate,
        skipDuplicates: true,
      });
    }

    // Get the created recurring booking with bookings count
    const result2 = await prisma.recurringBooking.findUnique({
      where: { id: recurringBooking.id },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            type: true,
            building: true,
            floor: true,
          },
        },
        semester: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json(result2, { status: 201 });
  } catch (error) {
    console.error('Create recurring booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
