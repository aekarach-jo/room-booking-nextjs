import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { createSemesterSchema } from '@/lib/validations/semester';

// GET /api/semesters - List all semesters
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const semesters = await prisma.semester.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: { specialDates: true },
        },
      },
    });

    return NextResponse.json(semesters);
  } catch (error) {
    console.error('Get semesters error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/semesters - Create semester (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const result = createSemesterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, startDate, endDate, isActive } = result.data;

    // If setting as active, deactivate other semesters
    if (isActive) {
      await prisma.semester.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const semester = await prisma.semester.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
      },
    });

    return NextResponse.json(semester, { status: 201 });
  } catch (error) {
    console.error('Create semester error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
