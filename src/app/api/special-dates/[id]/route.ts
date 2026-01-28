import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { updateSpecialDateSchema } from '@/lib/validations/special-date';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/special-dates/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const specialDate = await prisma.specialDate.findUnique({
      where: { id },
      include: {
        semester: {
          select: { id: true, name: true },
        },
      },
    });

    if (!specialDate) {
      return NextResponse.json({ error: 'Special date not found' }, { status: 404 });
    }

    return NextResponse.json(specialDate);
  } catch (error) {
    console.error('Get special date error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/special-dates/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const result = updateSpecialDateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...result.data };
    if (result.data.date) {
      updateData.date = new Date(result.data.date);
    }

    const specialDate = await prisma.specialDate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(specialDate);
  } catch (error) {
    console.error('Update special date error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/special-dates/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.specialDate.delete({ where: { id } });

    return NextResponse.json({ message: 'Special date deleted successfully' });
  } catch (error) {
    console.error('Delete special date error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
