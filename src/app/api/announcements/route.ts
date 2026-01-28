import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { createAnnouncementSchema } from '@/lib/validations/announcement';

// GET /api/announcements
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeExpired = searchParams.get('includeExpired') === 'true';
    const type = searchParams.get('type');

    const now = new Date();
    const where: Record<string, unknown> = {
      publishDate: { lte: now },
    };

    if (!includeExpired && !isAdmin(user)) {
      where.OR = [
        { expiryDate: null },
        { expiryDate: { gte: now } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/announcements
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const result = createAnnouncementSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        ...result.data,
        createdBy: user.id,
        publishDate: result.data.publishDate ? new Date(result.data.publishDate) : new Date(),
        expiryDate: result.data.expiryDate ? new Date(result.data.expiryDate) : null,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('Create announcement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
