import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { updateSemesterSchema } from '@/lib/validations/semester';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/semesters/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const semester = await prisma.semester.findUnique({
      where: { id },
      include: {
        specialDates: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }

    return NextResponse.json(semester);
  } catch (error) {
    console.error('Get semester error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/semesters/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const result = updateSemesterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...result.data };

    if (result.data.startDate) {
      updateData.startDate = new Date(result.data.startDate);
    }
    if (result.data.endDate) {
      updateData.endDate = new Date(result.data.endDate);
    }

    // If setting as active, deactivate other semesters
    if (result.data.isActive) {
      await prisma.semester.updateMany({
        where: { isActive: true, id: { not: id } },
        data: { isActive: false },
      });
    }

    const semester = await prisma.semester.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(semester);
  } catch (error) {
    console.error('Update semester error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/semesters/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.semester.delete({ where: { id } });

    return NextResponse.json({ message: 'Semester deleted successfully' });
  } catch (error) {
    console.error('Delete semester error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
