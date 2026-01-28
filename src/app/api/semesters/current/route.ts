import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/semesters/current - Get current active semester
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const semester = await prisma.semester.findFirst({
      where: { isActive: true },
      include: {
        specialDates: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!semester) {
      return NextResponse.json({ error: 'No active semester found' }, { status: 404 });
    }

    return NextResponse.json(semester);
  } catch (error) {
    console.error('Get current semester error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
