import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { createSpecialDateSchema } from '@/lib/validations/special-date';

// GET /api/special-dates
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};

    if (semesterId) {
      where.semesterId = semesterId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        (where.date as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.date as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const specialDates = await prisma.specialDate.findMany({
      where,
      include: {
        semester: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(specialDates);
  } catch (error) {
    console.error('Get special dates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/special-dates
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const result = createSpecialDateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const specialDate = await prisma.specialDate.create({
      data: {
        ...result.data,
        date: new Date(result.data.date),
      },
    });

    return NextResponse.json(specialDate, { status: 201 });
  } catch (error) {
    console.error('Create special date error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
